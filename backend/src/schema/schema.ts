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
            resolve: (_, args) => {

                return db.models.pageinfo.findAll({where: sanitize(args)})
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
            resolve: (_, args: {num?: string; public?: boolean; ispublic?: number, limit?: number}) => {

                let limit = args.limit;
                delete args.limit;

                if ('num' in args && !args.num) {
                    delete args.num;
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
        updateIssue: {
            type: Issues,
            description: 'Alter the latest issue',
            args: {
                name: {type: GraphQLString},
                public: {type: GraphQLBoolean}
            },
            resolve: async (_, args) => {

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
            resolve: (_, args: {data: {ids: string[]; level: number}[]}) => {

                const sanitized: typeof args = sanitize(args);

                sanitized.data.forEach(level => {

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
            resolve: (_, args: {ids: string[]}) => {

                const sanitized: typeof args = sanitize(args);

                db.models.users.destroy({
                    where: {
                        id: {
                            $in: sanitized.ids
                        }
                    }
                });
            }
        }
    })
});

export default new GraphQLSchema({
  query: Query,
  mutation: Mutation
});