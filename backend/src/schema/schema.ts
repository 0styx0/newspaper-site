import {
//   graphql,
  GraphQLSchema,
//   GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLBoolean,
  GraphQLList
} from 'graphql';

import {
    Users,
    Articles,
    Issues,
    Comments,
    Tags
} from './types';

import sanitize from '../helpers/sanitize';

import db from '../db/models';

const Query = new GraphQLObjectType({
   name: 'QuerySchema',
   description: 'Root query',
   fields: () => ({
       users: {
           type: new GraphQLList(Users),
           description: 'Users',
           args: {
               id: {type: GraphQLID},
               email: {type: GraphQLString},
           },
           resolve: (_, args) => db.models.users.findAll({where: sanitize(args)})
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
           resolve: (_, args) => db.models.pageinfo.findAll({where: sanitize(args)})
       },
       issues: {
           type: new GraphQLList(Issues),
           description: 'Issues',
           args: {
               num: {type: GraphQLID},
               public: {type: GraphQLBoolean}
           },
           resolve: (_, args: {num?: string; public?: boolean; ispublic?: number}) => {

               if ('public' in args) {
                   args.ispublic = +args.public;
                   delete args.public;
               }
               return db.models.issues.findAll({where: sanitize(args)})
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


export default new GraphQLSchema({
  query: Query,
//   mutation: Mutation
});