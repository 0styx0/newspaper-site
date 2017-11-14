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

import errors from '../helpers/errors';

import {
    Users,
    Articles,
    Issues,
    Comments,
    Jwt,
    PasswordRecovery,
    getMaxIssueAllowed,
    Mission
} from './types';
import sanitize from '../helpers/sanitize';
import SendMail from '../helpers/SendMail';

import db from '../db/models';
import * as dbHelpers from '../db/helpers';
import userHelpers from '../helpers/user';
import userValidator from '../helpers/user.validators';

import { setJWT } from '../helpers/jwt';

import { writeFile, readFile } from 'fs-extra';

const pathToMission = __dirname+'/../../src/../../src/missionView.html'; // path from dist/

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
        issues: {
            type: new GraphQLList(Issues),
            description: 'Issues',
            args: {
                num: {type: GraphQLID},
                public: {type: GraphQLBoolean},
                limit: {type: GraphQLInt}
            },
            resolve: async (_, args: {num?: number | Object; public?: boolean; ispublic?: number, limit?: number}, { jwt }) => {

                const sanitized = sanitize(args);
                let limit = sanitized.limit ? +sanitized.limit : null;
                delete sanitized.limit;

                const maxIssueAllowed = await getMaxIssueAllowed(jwt);

                if ('num' in sanitized) {

                    if (+sanitized.num < 1 || sanitized.num >= maxIssueAllowed && !jwt.id) {
                        sanitized.num = maxIssueAllowed - 1;
                    }

                } else {
                    sanitized.num = {
                        $ne: maxIssueAllowed
                    }
                }

                return db.models.issues.findAll({
                    where: sanitized,
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
        articles: {
            type: new GraphQLList(Articles),
            name: 'Previews',
            description: 'Preview of articles',
            args: {
                tag: {
                    type: GraphQLString
                },
                id: {type: GraphQLID},
                authorid: {type: GraphQLID},
                issue: {type: GraphQLInt},
                url: {type: GraphQLString},

            },
            resolve: async (
                _,
                args: {issue?: number, tag?: string, id?: string, authorid?: string, url?: string},
                { jwt }) => {

                const noArgs = !Object.values(args).some(arg => !!arg && arg != '0');

                if (noArgs) {
                    args.issue = await getMaxIssueAllowed(jwt) - 1;
                }

                const where = Object.assign({ // sequelize will  throw error if fields don't exist
                    maxIssue: await getMaxIssueAllowed(jwt),
                    tag: null,
                    issue: null,
                    id: null,
                    url: null,
                    authorid: null
                }, sanitize(args));

                return db.query(`SELECT * FROM pageinfo
                          WHERE (
                               (issue = :issue AND url = :url)
                              OR
                               id IN (
                                   SELECT art_id FROM tags WHERE tag = :tag
                               )
                               OR authorid = :authorid
                               OR id = :id
                          )
                              AND issue < :maxIssue
                          `, { replacements: where, type: db.QueryTypes.SELECT });
            }
        },
        allTags: {
            type: new GraphQLList(GraphQLString),
            description: 'All tags in database',
            resolve: async () => {

                const tagRows = await db.models.tag_list.findAll();

                const tags = tagRows.reduce((accum: string[], elt: {dataValues: { tag: string}}) =>
                  accum.concat([elt.dataValues.tag]), [])

                return tags;
            }
        },
        mission: {
            type: Mission,
            resolve: async () => ({
                mission: (await readFile(pathToMission)).toString()
            })
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

                userHelpers.mustBeLoggedIn(jwt);

                const newComment: {art_id?: string, artId?: string, content: string, authorid: string} =
                  Object.assign({authorid: jwt.id}, args);

                newComment.art_id = args.artId;
                delete newComment.artId;

                return new db.models.comments(sanitize(newComment)).save();
            }
        },
        deleteComment: {
            type: Comments,
            description: 'Delete a comment',
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLID)
                }
            },
            resolve: async (_, args: {id: string}, { jwt }) => {

                const sanitized = sanitize(args);

                const authorId = await db.models.comments.findOne({
                    attributes: ['authorid'],
                    where: {
                        id: sanitized.id
                    }
                });

                if (jwt.level > 2 || jwt.id === authorId.dataValues.id) {

                    return db.models.comments.destroy({
                        where: {
                            id: sanitized.id
                        }
                    });
                }

                throw new Error(errors.authority);
            }
        },
        updateIssue: {
            type: Issues,
            description: 'Alter the latest issue',
            args: {
                name: {type: GraphQLString},
                public: {type: GraphQLBoolean},
                password: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve: async (_, args: {password: string}, { jwt }) => {

                if (!jwt.level || jwt.level < 3) {
                    throw new Error(errors.authority);
                }

                if (!await userHelpers.checkPassword(jwt.id, args.password)) {
                    throw new Error(errors.password);
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
                password: {type: new GraphQLNonNull(GraphQLString)},
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
            resolve: async (_, args: {data: {ids: string[]; level: number}[], password: string}, { jwt }) => {

                const sanitized: typeof args = sanitize(args);

                if (jwt.level < 2 || !await userHelpers.checkPassword(jwt.id, args.password)) {
                    throw new Error(errors.password);
                }

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
                },
                password: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: async (_, args: {ids: string[], password: string}, { jwt }) => {

                if (!await userHelpers.checkPassword(jwt.id, args.password)) {
                    throw new Error(errors.password);
                }

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

                    return db.models.users.destroy({
                        where: {
                            id: {
                                $in: sanitized.ids
                            }
                        }
                    });
                }

                throw new Error(errors.authority);
            }
        },
        updateProfile: {
            type: new GraphQLNonNull(Users),
            description: 'Modify your own settings',
            args: {
                notifications: {type: GraphQLBoolean},
                twoFactor: {type: GraphQLBoolean},
                newPassword: {type: GraphQLString},
                password: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve: async (
                _,
                args: {notificationState?: boolean; twoFactor?: boolean; newPassword?: string, password: string},
                { jwt }
            ) => {

                userHelpers.mustBeLoggedIn(jwt);

                if (!await userHelpers.checkPassword(jwt.id, args.password)) {
                    throw new Error(errors.password);
                }
                delete args.password; // so password isn't updated

                let sanitized = sanitize(args);

                if (args.newPassword) {
                    sanitized.password = await userHelpers.encrypt(args.newPassword);
                    delete sanitized.newPassword;
                }

                db.models.users.update(sanitized, {
                    where: {
                        id: jwt.id
                    }
                });

                return { id: jwt.id };
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
        createArticle: {
            type: Articles,
            description: 'Create an article',
            args: {
                tags: {
                    type: new GraphQLList(GraphQLString),
                },
                url: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                article: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: async (_, args: {tags: string[], article: string, url: string}, { jwt }) => {

                userHelpers.mustBeLoggedIn(jwt);

                const sanitized = sanitize(args);

                const maxIssueRow = await db.models.issues.findOne({
                    attributes: ['num', 'ispublic']
                });
                let issue = maxIssueRow.dataValues.num;

                if (maxIssueRow.dataValues.ispublic) {

                    issue++

                    new db.models.issues({
                        num: issue + 1
                    });
                }

                const { lede, body, images } = dbHelpers.modifyArticle(sanitized.article);

                const data = {
                    lede,
                    body,
                    url: encodeURIComponent(sanitized.url),
                    issue,
                    authorid: jwt.id
                };

                const article = await new db.models.pageinfo(data).save();

                db.models.images.bulkCreate(Object.assign(images, {art_id: article.dataValues.id}));

                const tags = sanitized.tags.map(tag => {tag, art_id: article.dataValues.id});
                new db.models.tags.bulkCreate(tags).save();

                return article;
            }
        },
        updateArticles: {
            type: new GraphQLList(Articles),
            description: 'Modify article data',
            args: {
                password: {
                    type: new GraphQLNonNull(GraphQLString)
                },
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
                args: {
                    data: {id: string, article?: string, tags?: string[], displayOrder?: number, display_order?: number}[],
                    password: string
                },
                { jwt }
            ) => {

                if (!await userHelpers.checkPassword(jwt.id, args.password)) {
                    throw new Error(errors.password);
                }
                delete args.password;

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

                return sanitized.data.map(async (article, i) => {

                    if (jwt.level < 3 && rows[i].dataValues.authorid !== jwt.id) {
                        throw new Error(errors.authority);
                    }

                    // displayOrder doesn't exist in db, calling it that since js like camels but sql likes snakes
                    if ('displayOrder' in article) {
                        article.display_order = article.displayOrder;
                        delete article.displayOrder;
                    }

                    if (article.tags) {

                        db.models.tags.destroy({where: { art_id: article.id }});

                        const tags = article.tags.map(tag => {tag, art_id: article.id});

                        db.models.tags.bulkCreate(tags);
                        delete article.tags;
                    }

                    const { lede, body, images } = dbHelpers.modifyArticle(article.article);

                    delete article.article;

                    const updatedArticle = await rows[i].update(Object.assign(article, {lede, body}));

                    db.models.images.destroy({
                        where: {
                            art_id: article.id
                        }
                    });

                    db.models.images.bulkCreate(Object.assign(images, {art_id: article.id}));

                    return updatedArticle;
                });
            }
        },
        deleteArticles: {
            type: new GraphQLList(Articles),
            description: 'Delete articles',
            args: {
                ids: {
                    type: new GraphQLList(GraphQLID)
                },
                password: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: async (_, args: {ids: string[], password: string}, { jwt }) => {

                if (!await userHelpers.checkPassword(jwt.id, args.password)) {
                    throw new Error(errors.password);
                }

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
                    throw new Error(errors.authority);
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

                await db.models.images.destroy({
                    where: {
                        art_id: {
                            $in: sanitized.ids
                        }
                    }
                })

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

                if (user && await userHelpers.compareEncrypted(args.password, user.dataValues.password)) {

                    user.dataValues.profileLink = user.dataValues.email.split('@')[0];

                    return { jwt: setJWT(user.dataValues) };
                }

                throw new Error(errors.password);
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

                if (!jwt.id) { // not using userHelpers.mustBeLoggedIn since user isn't really logged in now
                    throw new Error(errors.noUser);
                }

                const user = await db.models.users.findOne({

                    attributes: ['id', 'email', 'level', 'auth', 'auth_time'],
                    where: {
                        id: jwt.id
                    }
                });

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

                throw new Error(errors.authCode);
            }
        },
        editMission: {
            type: Mission,
            description: 'Edit mission statement',
            args: {
                mission: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: async (_, args: {mission: string}, { jwt }) => {

                const sanitized = sanitize(args);

                if (sanitized.mission && jwt.level > 2) {

                    await writeFile(
                        pathToMission,
                        sanitized.mission,
                        (err) => {
                            if (err) {
                                console.log(err);
                                throw new Error(errors.unknown);
                            }
                        }
                    );

                    return { mission: sanitized.mission };
                }

                throw new Error(errors.authority);
            }
        },
        createTag: {
            type: new GraphQLList(GraphQLString),
            description: 'All tags in database',
            args: {
                tag: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: async (_, args: {tag: string}, { jwt }) => {

                userHelpers.mustBeLoggedIn(jwt);

                return new db.models.tag_list(sanitize(args)).save();
            }
        }
    }),
});

export default new GraphQLSchema({
  query: Query,
  mutation: Mutation
});