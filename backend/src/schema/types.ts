import {
  graphql,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLBoolean,
  GraphQLList
} from 'graphql';

const Users = new GraphQLObjectType({
    name: 'Users',
    description: 'Account holders of the site',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLID)},
        username: {type: new GraphQLNonNull(GraphQLString)},
        firstName: {type: new GraphQLNonNull(GraphQLString)},
        middleName: {type: new GraphQLNonNull(GraphQLString)},
        lastName: {type: new GraphQLNonNull(GraphQLString)},
        email: {type: new GraphQLNonNull(GraphQLString)},
        level: {type: new GraphQLNonNull(GraphQLInt)},
        notifications: {type: new GraphQLNonNull(GraphQLBoolean)},

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
        imgUrl: {type: new GraphQLNonNull(new GraphQLList(GraphQLString))},
        slideImg: {type: new GraphQLNonNull(new GraphQLList(GraphQLString))},
        issue: {type: new GraphQLNonNull(GraphQLInt)},
        views: {type: new GraphQLNonNull(GraphQLInt)},
        displayOrder: {type: new GraphQLNonNull(GraphQLInt)},
        authorId: {type: new GraphQLNonNull(GraphQLID)},
    })
});

const Issues = new GraphQLObjectType({
    name: 'Issues',
    description: 'Issues - Every article has one',
    fields: () => ({
        num: {type: new GraphQLNonNull(GraphQLID)},
        name: {type: new GraphQLNonNull(GraphQLString)},
        public: {type: new GraphQLNonNull(GraphQLBoolean)},
        datePublished: {type: new GraphQLNonNull(GraphQLString)},
    })
});

const Comments = new GraphQLObjectType({
    name: 'Comments',
    description: 'Comments in articles',
    fields: () => ({
        artId: {type: new GraphQLNonNull(GraphQLID)},
        authorId: {type: new GraphQLNonNull(GraphQLID)},
        content: {type: new GraphQLNonNull(GraphQLString)},
        dateCreated: {type: new GraphQLNonNull(GraphQLString)},
    })
});

const Tags = new GraphQLObjectType({
   name: 'Tags',
   description: 'Tags of articles',
   fields: () => ({
        artId: {type: new GraphQLNonNull(GraphQLID)},
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