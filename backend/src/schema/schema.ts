import {
//   graphql,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
//   GraphQLInt,
  GraphQLID,
//   GraphQLBoolean,
  GraphQLList
} from 'graphql';

import {
    Users,
    // Articles,
    // Issues,
    // Comments,
    // Tags
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
   })
});


export default new GraphQLSchema({
  query: Query,
//   mutation: Mutation
});