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
            type: new GraphQLNonNull(GraphQLString),
            resolve: (user) => user.m_name
        },
        lastName: {
            type: new GraphQLNonNull(GraphQLString),
            resolve: (user) => user.l_name
        },
        email: {type: new GraphQLNonNull(GraphQLString)},
        level: {type: new GraphQLNonNull(GraphQLInt)},
        notifications: {type: new GraphQLNonNull(GraphQLBoolean)},
        views: {
            type: GraphQLInt,
            resolve: (user) => +db.models.pageinfo.sum('views', {
                where: {authorid: sanitize(user.id)}
            }) || 0 // don't know why I need + and || but I do
        },
        articles: {
            type: GraphQLInt,
            resolve: (user) => db.models.pageinfo.count({
                where: {authorid: sanitize(user.id)}
            })
        },
        profileLink: {
            type: new GraphQLNonNull(GraphQLString),
            resolve: user => user.email.split('@')[0]
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
        dateCreated: {type: new GraphQLNonNull(GraphQLString)},
        lede: {type: new GraphQLNonNull(GraphQLString)},
        body: {type: new GraphQLNonNull(GraphQLString)},
        url: {type: new GraphQLNonNull(GraphQLString)},
        article: {type: new GraphQLNonNull(GraphQLString)},
        imgUrl: {type: new GraphQLNonNull(new GraphQLList(GraphQLString))},
        slideImages: {type: new GraphQLNonNull(new GraphQLList(GraphQLString))},
        issue: {type: new GraphQLNonNull(GraphQLInt)},
        views: {type: new GraphQLNonNull(GraphQLInt)},
        displayOrder: {type: new GraphQLNonNull(GraphQLInt)},
        authorId: {type: new GraphQLNonNull(GraphQLID)},
        author: {
            type: new GraphQLNonNull(Users),
            resolve: (user) => db.models.users.findById(sanitize(user.authorid))
        }
    })
});

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
            type: new GraphQLNonNull(Articles),
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
        dateCreated: {type: new GraphQLNonNull(GraphQLString)},
        author: {
            type: new GraphQLNonNull(Users),
            resolve: (user) => db.models.users.findById(sanitize(user.authorid))
        }
    })
});

const Tags = new GraphQLObjectType({
   name: 'Tags',
   description: 'Tags of articles',
   fields: () => ({
       id: {type: new GraphQLNonNull(GraphQLID)},
        artId: {
            type: new GraphQLNonNull(GraphQLID),
            resolve: (tag) => tag.art_id
        },
        tag1: {type: new GraphQLNonNull(GraphQLString)},
        tag2: {type: new GraphQLNonNull(GraphQLString)},
        tag3: {type: new GraphQLNonNull(GraphQLString)},
   })
});

export {
    Users,
    Articles,
    Issues,
    Comments,
    Tags
};