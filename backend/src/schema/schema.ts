import {
//   graphql,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLBoolean,
  GraphQLList,
  GraphQLInputObjectType
} from 'graphql';

import {
    Users,
    Articles,
    Issues,
    Comments,
    Tags,
    Jwt,
    PasswordRecovery,
    getMaxIssueAllowed
} from './types';
import sanitize from '../helpers/sanitize';
import SendMail from '../helpers/SendMail';

import db from '../db/models';
import userHelpers from '../helpers/user';
import userValidator from '../helpers/user.validators';

import { setJWT } from '../helpers/jwt';

const Query = new GraphQLObjectType({
    name: 'QuerySchema',
    description: 'Root query',
    fields: () => ({
        users: {
            type: new GraphQLList(Users),
            description: 'Users',
            args: {
                id: {type: GraphQLID},
                profileLink: {type: GraphQLString},
            },
            resolve: (_, args) => {

                const sanitized = sanitize(args);

                if (sanitized.profileLink) {

                    sanitized.email = {
                        $like: sanitized.profileLink + '@%'
                    }

                    delete sanitized.profileLink;
                }

                if (sanitized.twoFactor) {
                    sanitized.two_fa_enabled = sanitized.twoFactor;
                    delete sanitized.twoFactor;
                }

                return db.models.users.findAll({
                    where: sanitized
                })
            }
        },
        articles: {
            type: new GraphQLList(Articles),
            description: 'Articles',
            args: {
                id: {type: GraphQLID},
                authorid: {type: GraphQLID},
                url: {type: GraphQLString},
                issue: {type: GraphQLInt},
            },
            resolve: async (_, args, { jwt }) => {

                const where = Object.assign({
                    issue: {
                        $ne: await getMaxIssueAllowed(jwt)
                    }
                }, sanitize(args));

                return db.models.pageinfo.findAll({
                    where
                })
            }
        },
        issues: {
            type: new GraphQLList(Issues),
            description: 'Issues',
            args: {
                num: {type: GraphQLID},
                public: {type: GraphQLBoolean},
                limit: {type: GraphQLInt}
            },
            resolve: async (_, args: {num?: number | Object; public?: boolean; ispublic?: number, limit?: number}, { jwt }) => {

                let limit = args.limit;
                delete args.limit;

                if ('num' in args) {

                    const maxIssueAllowed = await getMaxIssueAllowed(jwt);

                    if (args.num == maxIssueAllowed && !jwt.id) {
                        args.num = maxIssueAllowed - 1;
                    }

                    if (+args.num === 0) {

                        args.num = (
                            await db.models.issues.findOne({
                                order: [ [ 'num', 'DESC' ]]
                            })).dataValues.num

                    }
                    else if (!args.num) {
                        delete args.num;
                    }
                } else {
                    args.num = {
                        $ne: await getMaxIssueAllowed(jwt)
                    }
                }

                if ('public' in args) {
                    args.ispublic = +args.public;
                    delete args.public;
                }

                return db.models.issues.findAll({
                    where: sanitize(args),
                    order: [['num', 'DESC']],
                    limit
                    })
            }
        },
        comments: {
            type: new GraphQLList(Comments),
            description: 'Comments',
            args: {
                id: {type: GraphQLID},
                authorid: {type: GraphQLID},
                artId: {type: GraphQLID},
            },
            resolve: (_, args) => db.models.comments.findAll({where: sanitize(args)})
        },
        tags: {
            type: new GraphQLList(Tags),
            description: 'Tags of articles',
            args: {
                artId: {type: GraphQLID},
            },
            resolve: (_, args) => db.models.tags.findAll({where: sanitize(args)})
        }

    })
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Mutate data',
    fields: () => ({
        createComment: {
            type: Comments,
            description: 'Create a comment',
            args: {
                artId: { // will switch to art_id but figured will keep js camelCase for consistency
                    type: new GraphQLNonNull(GraphQLID)
                },
                content: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: (_, args: {artId: string, content: string}, { jwt }) => {

                const newComment: {art_id?: string, artId?: string, content: string, authorid: string} =
                  Object.assign({authorid: jwt.id}, args);

                newComment.art_id = args.artId;
                delete newComment.artId;

                return new db.models.comments(sanitize(newComment)).save();
            }
        },
        updateIssue: {
            type: Issues,
            description: 'Alter the latest issue',
            args: {
                name: {type: GraphQLString},
                public: {type: GraphQLBoolean}
            },
            resolve: async (_, args, { jwt }) => {

                if (jwt.level < 3) {
                    return false;
                }

                const maxIssueRow = await db.models.issues.findOne({
                                    order: [ [ 'num', 'DESC' ]],
                                });

                await db.models.issues.update(sanitize(args), {
                    where: {
                        num: maxIssueRow.dataValues.num
                    }
                });

                return Object.assign(maxIssueRow.dataValues, args); // optimistic that update worked
            }
        },
        createUser: {
            type: Users,
            description: 'Sign up for an account',
            args: {
                username: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                email: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                password: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                level: {
                    type: GraphQLInt
                },
                firstName: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                middleName: {
                    type: GraphQLString
                },
                lastName: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: async (
                _,
                args: {
                    username: string,
                    email: string,
                    password: string,
                    level: number,
                    firstName: string,
                    middleName: string,
                    lastName: string
                },
                { jwt }) => {

                const sanitized = sanitize(args);
                const unmodifiedEmail = sanitized.email;

                sanitized.level = userValidator.level(sanitized.level, jwt.level);
                sanitized.email = userValidator.email(sanitized.email);
                args.password = userValidator.password(args.password);

                const codes = await userHelpers.generateAuthCode();

                const user = Object.assign(sanitized, {
                    password: await userHelpers.encrypt(args.password),
                    auth: await codes.encrypted,
                    email: '.' + sanitized.email
                });

                SendMail.emailAuth(unmodifiedEmail, unmodifiedEmail.split('@')[0], codes.plaintext);

                return new db.models.users(user).save();
            }
        },
        updateUsers: {
            type: new GraphQLList(Users),
            description: 'Modify user data',
            args: {
                data: {
                    type: new GraphQLList(
                        new GraphQLInputObjectType({
                            name: 'IdLevelList',
                            description: 'Format: {ids: string[]; level: number}[]',
                            // description: 'Format: {id: string[]; level: number}[]',
                            fields: {
                                ids: {
                                    type: new GraphQLNonNull(new GraphQLList(GraphQLID))
                                },
                                level: {
                                    type: new GraphQLNonNull(GraphQLInt)
                                }
                            }
                        })
                    )
                }
            },
            resolve: (_, args: {data: {ids: string[]; level: number}[]}, { jwt }) => {

                const sanitized: typeof args = sanitize(args);

                sanitized.data.forEach(level => {

                    if (jwt.level < level.level) {
                        return;
                    }

                    db.models.users.update(
                        {
                            level: level.level
                        },
                        {
                        where: {
                            id: {
                                $in: level.ids
                            }
                        }
                    });
                });
            }
        },
        deleteUsers: {
            type: new GraphQLList(Users),
            description: 'Delete users',
            args: {
                ids: {
                    type: new GraphQLList(GraphQLID)
                }
            },
            resolve: async (_, args: {ids: string[]}, { jwt }) => {

                const sanitized: typeof args = sanitize(args);

                const maxLevelRow = await db.models.users.findOne({
                    attributes: ['level'],
                    order: [ [ 'level', 'DESC' ]],
                    where: {
                        id: {
                            $in: sanitized.ids
                        }
                    }
                });

                const adminAndDeletingNonAdmins = jwt.level > 2 && maxLevelRow.dataValues.level < jwt.level;
                const regularAndDeletingSelf = sanitized.ids.indexOf(jwt.id) !== -1 && sanitized.ids.length === 1;

                if (adminAndDeletingNonAdmins || regularAndDeletingSelf) {

                    db.models.users.destroy({
                        where: {
                            id: {
                                $in: sanitized.ids
                            }
                        }
                    });
                }
            }
        },
        updateProfile: {
            type: new GraphQLNonNull(Users),
            description: 'Modify your own settings',
            args: {
                notificationStatus: {type: GraphQLBoolean},
                twoFactor: {type: GraphQLBoolean}
            },
            resolve: async (_, args: {notificationState?: boolean; id: string; twoFactor?: boolean}, { jwt }) => {

                const sanitized = sanitize(args);

                return db.models.users.update(sanitized, {
                    where: {
                        id: jwt.id
                    }
                });
            }
        },
        recoverPassword: {
            type: PasswordRecovery,
            description: 'Get a new password',
            args: {
                email: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                authCode: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                username: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: async (_, args: {email: string, authCode: string, username: string}) => {

                const sanitized = sanitize(args);

                const userRow = await db.models.users.findOne({
                    where: {
                        email: sanitized.email
                    }
                });

                const data = userRow.dataValues;

                if (
                    data.email &&
                    data.username === sanitized.username &&
                    await userHelpers.compareEncrypted(args.authCode, data.auth)
                ) {

                    const codes = await userHelpers.generateAuthCode(30);

                    SendMail.passwordRecovery(
                        codes.plaintext,
                        data.username,
                        data.email
                    );

                    db.models.users.update({password: codes.encrypted}, {where: {email: sanitized.email}});

                    return {
                        message: 'Password has been changed. An email has been sent.'
                    };
                }

                return {
                    message: 'Error: Invalid data given.'
                };
            }
        },
        updateArticles: {
            type: new GraphQLList(Articles),
            description: 'Modify article data',
            args: {
                data: {
                    type: new GraphQLList(
                        new GraphQLInputObjectType({
                            name: 'Fields',
                            description: 'Format: {id: string, article?: string, tags?: string[], displayOrder?: number}',
                            fields: {
                                id: {
                                    type: new GraphQLNonNull(GraphQLString)
                                },
                                tags: {
                                    type: new GraphQLList(GraphQLString)
                                },
                                displayOrder: {
                                    type: GraphQLInt
                                },
                                article: {
                                    type: GraphQLString
                                }
                            }
                        })
                    )
                }
            },
            resolve: async (
                _,
                args: {data: {id: string, article?: string, tags?: string[], displayOrder?: number, display_order?: number}[]},
                { jwt }
            ) => {

                const sanitized: typeof args = sanitize(args);

                /* must find before update else errors in model.
                 For some reason gettermethods are called even on update
                 and must make sure it has data needed. Google was no help */
                const rows = await db.models.pageinfo.findAll({
                        where: {
                            id: {
                                $in: sanitized.data.map(item => item.id)
                            }
                        },
                        include: [ { model : db.models.tags }]
                    });

                return sanitized.data.map((article, i) => {

                    if (jwt.level < 3 && rows[i].dataValues.authorid !== jwt.id) {
                        return;
                    }

                    // displayOrder doesn't exist in db, calling it that since js like camels but sql likes snakes
                    if ('displayOrder' in article) {
                        article.display_order = article.displayOrder;
                        delete article.displayOrder;
                    }

                    if (article.tags) {

                        db.models.tags.update({all: article.tags}, {where: {art_id: article.id}});
                    }

                    return rows[i].update(article);
                });
            }
        },
        deleteArticles: {
            type: new GraphQLList(Articles),
            description: 'Delete articles',
            args: {
                ids: {
                    type: new GraphQLList(GraphQLID)
                }
            },
            resolve: async (_, args: {ids: string[]}, { jwt }) => {

                const sanitized: typeof args = sanitize(args);

                const authorIds = await db.models.pageinfo.find({
                    attributes: ['authorid'],
                    where: {
                        id: {
                            $in: sanitized.ids
                        }
                    }
                });

                const uniqueAuthors = [...new Set(authorIds.dataValues)];
                const onlyArticlesOfCurrentUser = uniqueAuthors.length === 1 && uniqueAuthors[0] === jwt.id

                if (jwt.level < 3 && !onlyArticlesOfCurrentUser) {
                    return;
                }

                await db.models.comments.destroy({
                    where: {
                        art_id: {
                            $in: sanitized.ids
                        }
                    }
                });

                await db.models.tags.destroy({
                    where: {
                        art_id: {
                            $in: sanitized.ids
                        }
                    }
                });

                await db.models.pageinfo.destroy({
                    where: {
                        id: {
                            $in: sanitized.ids
                        }
                    }
                });
            }
        },
        login: {
            type: Jwt,
            description: 'Log in a user',
            args: {
                username: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                password: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: async (_, args: {username: string, password: string}, { req }) => {

                const sanitized = sanitize(args);

                // if first time logging in, email is unverified so has dot
                const potentialEmail = sanitized.username[0] == '.' ? sanitized.username.substr(1) : sanitized.username;

                const user = await db.models.users.findOne({

                    attributes: ['id', 'email', 'level', 'password'],
                    where: {
                        $or: [
                            {
                                username: sanitized.username
                            },
                            {
                                email: potentialEmail + '@%'
                            }
                        ]
                    }
                });

                if (await userHelpers.compareEncrypted(args.password, user.dataValues.password)) {

                    user.dataValues.profileLink = user.dataValues.email.split('@')[0];

                    return { jwt: setJWT(user.dataValues) };
                }

                throw new Error('Incorrect password');
            }
        },
        verifyEmail: {
            type: Jwt,
            description: 'Verify email',
            args: {
                authCode: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: async (_, args: {authCode: string}, { jwt, req }) => {

                const user = await db.models.users.findOne({

                    attributes: ['id', 'email', 'level', 'auth', 'auth_time'],
                    where: {
                        id: jwt.id
                    }
                });

                if (!jwt.id) {
                    throw new Error('User not logged in');
                }

                if (user.dataValues.email[0] !== '.') {
                    return { jwt: setJWT(jwt) };
                }

                const parsedAuthTime = Date.parse(user.dataValues.auth_time);
                const authTimePlusOneDay = parsedAuthTime + (60 * 60 * 24 * 1000);
                const authCodeSentLessThanOneDayAgo = authTimePlusOneDay - Date.now() > 0;

                if (!authCodeSentLessThanOneDayAgo) {
                    throw new RangeError('Code sent more than a day ago');
                }

                if (await userHelpers.compareEncrypted(args.authCode, user.dataValues.auth)) {

                    const verifiedEmail = user.dataValues.email.substr(1);

                    db.models.users.update(
                        {
                            email: verifiedEmail
                        },
                        {
                            where: {
                                id: jwt.id
                            }
                        });

                    user.dataValues.profileLink = verifiedEmail.split('@')[0];
                    user.dataValues.email = verifiedEmail;

                    return { jwt: setJWT(user.dataValues) };
                }

                throw new Error('Invalid auth code');
            }
        }
    }),
});

export default new GraphQLSchema({
  query: Query,
  mutation: Mutation
});