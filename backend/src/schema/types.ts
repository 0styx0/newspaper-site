import { jwt } from './../helpers/jwt';
import {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLBoolean,
  GraphQLList
} from 'graphql';

import db from '../db/models';
import sanitize from '../helpers/sanitize';

/**
 * @return max issue + 1 a user can view, or infinity if user is logged in
 *
 * Used in stuff like `select * from pageinfo where issue != getMaxIssueAllowed`
 */
export async function getMaxIssueAllowed(jwt: jwt) {

    if (jwt && jwt.id) {
        return null;
    }

    const maxIssueRow = (await db.models.issues.findOne({
        attributes: ['num'],
        where: {
            ispublic: false
        }
    }));

    return maxIssueRow.dataValues.num;
}


const Users = new GraphQLObjectType({
    name: 'Users',
    description: 'Account holders of the site',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLID)},
        username: {type: new GraphQLNonNull(GraphQLString)},
        firstName: {
            type: new GraphQLNonNull(GraphQLString),
            resolve: (user) => user.f_name
        },
        middleName: {
            type: GraphQLString,
            resolve: (user) => user.m_name
        },
        lastName: {
            type: new GraphQLNonNull(GraphQLString),
            resolve: (user) => user.l_name
        },
        fullName: {
            type: new GraphQLNonNull(GraphQLString),
        },
        email: {
            type: GraphQLString,
            resolve: (user, _, { jwt }) =>

                jwt.id == user.id ? user.email : null
        },
        level: {type: new GraphQLNonNull(GraphQLInt)},
        notifications: {
            type: GraphQLBoolean,
            resolve: (user, test,  { jwt }) =>
                jwt.id == user.id ? user.notifications : null
        },
        twoFactor: {
            type: GraphQLBoolean,
            resolve: (user, _, { jwt }) =>

                jwt.id == user.id ? user.two_fa_enabled : null
        },
        views: {
            type: GraphQLInt,
            resolve: async (user, _, { jwt }) => +db.models.pageinfo.sum('views', {
                where: {
                    authorid: sanitize(user.id),
                    issue: {
                        $ne: await getMaxIssueAllowed(jwt)
                    }
                }
            }) || 0 // don't know why I need + and || but I do
        },
        articleCount: {
            type: GraphQLInt,
            resolve: async (user, _, { jwt }) => {

                return db.models.pageinfo.count({
                    where: {
                        authorid: sanitize(user.id),
                        issue: {
                            $ne: await getMaxIssueAllowed(jwt)
                        }
                    }
                })
            }
        },
        profileLink: {
            type: new GraphQLNonNull(GraphQLString),
            resolve: user => user.email.split('@')[0]
        },
        articles: {
            type: new GraphQLNonNull(new GraphQLList(Articles)),
            resolve: async (user, _, { jwt }) => {

                return db.models.pageinfo.findAll({
                    where: {
                        authorid: user.id,
                        issue: {
                            $ne: await getMaxIssueAllowed(jwt)
                        }
                    }
                })
            }
        },
        canEdit: {
            type: GraphQLBoolean,
            resolve: (user, _, { jwt }) => jwt.id === user.id || jwt.level > user.level
        }


        /* // PRIVATE types. Putting them here just to complete the db table
        // don't use these
        password: {type: new GraphQLNonNull(GraphQLString)},
        authCode: {type: new GraphQLNonNull(GraphQLString)},
        authTime: {type: new GraphQLNonNull(GraphQLString)},
        */
    })
});

const Articles = new GraphQLObjectType({
    name: 'Articles',
    description: 'Articles created by users',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLID)},
        dateCreated: {
            type: new GraphQLNonNull(GraphQLString),
            resolve: article => article.created
        },
        lede: {type: new GraphQLNonNull(GraphQLString)},
        body: {type: new GraphQLNonNull(GraphQLString)},
        url: {type: new GraphQLNonNull(GraphQLString)},
        article: {
            type: new GraphQLNonNull(GraphQLString),
            resolve: (article, _, { jwt }) => {

                /**
                 * Adds view to article
                 */
                (async function addView() {

                    if (!jwt.id) {
                        const row = await db.models.pageinfo.findOne({where: {id: article.id}});
                        row.update({views: article.views + 1});
                    }
                })();

                let content = article.lede + article.body;

                (article.img_url || []).forEach((img: string) => {

                    if (content.indexOf("data-src") !== -1) {
                        content = content.replace('data-src', `src='${img}'`);
                    }
                });

                return content;
            }
        },
        issue: {type: new GraphQLNonNull(GraphQLInt)},
        views: {type: new GraphQLNonNull(GraphQLInt)},
        displayOrder: {
            type: new GraphQLNonNull(GraphQLInt),
            resolve: article => article.display_order
        },
        tags: {
            type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
            resolve: async (article) => {

                const tags = await db.models.tags.findAll({
                    where: {art_id: article.id},
                    attributes: ['tag']
                });

                return tags.reduce((accum, elt) => accum.concat([elt.dataValues.tag]), []);
            }
        },
        authorId: {type: new GraphQLNonNull(GraphQLID)},
        author: {
            type: new GraphQLNonNull(Users),
            resolve: async (article, args, { loaders }) => loaders.default.user.load(sanitize(article.authorid))
        },
        comments: {
            type: new GraphQLList(Comments),
            resolve: (article) => db.models.comments.findAll({
                where: {art_id: article.id}
            })
        },
        images: {
            type: new GraphQLList(Images),
            args: {
                slide: {
                    type: GraphQLBoolean
                }
            },
            resolve: (article, args: {slide: boolean | boolean}) => {

                const sanitized = sanitize(args);

                const where = Object.assign(sanitized, {art_id: article.id});

                if (sanitized.slide) {
                    sanitized.slide = +args.slide
                }

                return db.models.images.findAll({
                    where
                });
            }
        },
        canEdit: {
            type: new GraphQLNonNull(GraphQLBoolean),
            resolve: (article, _, { jwt }) => {
                return jwt.level > 2 || jwt.id == article.authorid;
            }
        }
    })
});

const Images = new GraphQLObjectType({
    name: 'Images',
    description: 'Images in articles',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLID)},
        url: {type: new GraphQLNonNull(GraphQLString)},
        slide: {type: new GraphQLNonNull(GraphQLBoolean)},
        artId: {
            type: new GraphQLNonNull(GraphQLID),
            resolve: image => image.art_id
        },

    })
})

const Issues = new GraphQLObjectType({
    name: 'Issues',
    description: 'Issues - Every article has one',
    fields: () => ({
        num: {type: new GraphQLNonNull(GraphQLID)},
        name: {type: GraphQLString},
        public: {
            type: new GraphQLNonNull(GraphQLBoolean),
            resolve: (issue) => !!issue.ispublic
        },
        datePublished: {
            type: GraphQLString,
            resolve: (issue) => issue.madepub
        },
        articles: {
            type: new GraphQLNonNull(new GraphQLList(Articles)),
            resolve: (issue) => db.models.pageinfo.findAll({
                where: sanitize({issue: issue.num})
            })
        },
        views: {
            type: new GraphQLNonNull(GraphQLInt),
            resolve: async (issue) => db.models.pageinfo.sum('views', {
                where: {
                    issue: sanitize(issue.num)
                }
            })
        },
        max: {
            type: new GraphQLNonNull(GraphQLInt),
            resolve: async (issue) => db.models.issues.max('num')
        },
        canEdit: {
            type: GraphQLBoolean,
            resolve: (issue, _, { jwt }) => jwt.level > 2 && !issue.public
        }
    })
});

const Comments = new GraphQLObjectType({
    name: 'Comments',
    description: 'Comments in articles',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLID)},
        artId: {
            type: new GraphQLNonNull(GraphQLID),
            resolve: (comment) => comment.art_id
        },
        authorId: {
            type: new GraphQLNonNull(GraphQLID),
            resolve: (comment) => comment.authorid
        },
        content: {type: new GraphQLNonNull(GraphQLString)},
        dateCreated: {
            type: new GraphQLNonNull(GraphQLString),
            resolve: comment => comment.created
        },
        author: {
            type: new GraphQLNonNull(Users),
            resolve: (comment, args, { loaders }) => loaders.default.user.load(sanitize(comment.authorid))
        },
        canDelete: {
            type: new GraphQLNonNull(GraphQLBoolean),
            resolve: (comment, _, { jwt }) =>
                jwt.level > 2 || jwt.id === comment.authorid
        }
    })
});

const Jwt = new GraphQLObjectType({
    name: 'JWT',
    description: 'JSON web token',
    fields: () => ({
        jwt: {
            type: GraphQLString
        }
    })
});

const PasswordRecovery = new GraphQLObjectType({
    name: 'RecoverPassword',
    description: 'Recover forgotten password',
    fields: () => ({
        message: {
            type: GraphQLString
        }
    })
});

const Mission = new GraphQLObjectType({
    name: 'Mission',
    description: 'Mission statement',
    fields: () => ({
        mission: {
            type: GraphQLString
        },
        canEdit: {
            type: GraphQLBoolean,
            resolve: (mission, _, { jwt }) => jwt.level > 2
        }
    })
});

export {
    Users,
    Articles,
    Issues,
    Comments,
    Jwt,
    PasswordRecovery,
    Images,
    Mission
};