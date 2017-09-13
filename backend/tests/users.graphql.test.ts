import * as chai from 'chai';
import * as chaiHttp from 'chai-http';
import app from '../app';
// import gql from 'graphql-tag';

const expect = chai.expect;

/*
{
    "query": "# Welcome to GraphiQL\n#\n# GraphiQL is an in-browser tool for writing, validating, and\n# testing GraphQL queries.\n#\n# Type queries into this side of the screen, and you will see intelligent\n# typeaheads aware of the current GraphQL type schema and live syntax and\n# validation errors highlighted within the text.\n#\n# GraphQL queries typically start with a \"{\" character. Lines that starts\n# with a # are ignored.\n#\n# An example GraphQL query might look like:\n#\n#     {\n#       field(arg: \"value\") {\n#         subField\n#       }\n#     }\n#\n# Keyboard shortcuts:\n#\n#       Run Query:  Ctrl-Enter (or press the play button above)\n#\n#   Auto Complete:  Ctrl-Space (or just start typing)\n#\n\n\n    query users($profileLink: String) {\n        users(profileLink: $profileLink) {\n            articles {\n                id\n                url\n                dateCreated\n                tags\n                views\n                issue\n                canEdit\n            }\n            views\n            level\n            id\n            fullName\n            canEdit\n        }\n    }\n\n",
    "variables": null,
    "operationName": "users"
}*/

chai.use(chaiHttp);

describe('queries', () => {

    describe('work with args', () => {

        it('profileLink', (done) => {

            const query = `

                query users($profileLink: String) {
                    users(profileLink: $profileLink) {
                        articles {
                            id
                            url
                            dateCreated
                            tags
                            views
                            issue
                            canEdit
                        }
                        views
                        level
                        id
                        fullName
                        canEdit
                    }
                }
            `;

            chai.request(app).post('/graphql').send({query, variables: {profileLink: }, operationName: 'users'}).end(async (err, res) => {

                expect(err).to.be.null;
                expect(res).to.have.status(200);

                console.log((await res).body);

                done();
            });
        });

        it('id', () => {


        });
    });

    it('gets all users if no args', () => {

    });

    describe('when not logged in as current user, cannot access', () => {

        // foreach set level to 3

        it('password', () => {


        });

        it('username', () => {


        });

        it('notifications setting', () => {


        });

        it('two factor setting', () => {


        });
    });

    describe('when not logged in', () => {

        it('can only get articleCount of public articles', () => {


        });

        it('can only view public articles', () => {


        });

        it('canEdit = false', () => {


        });
    });

    describe('when yes logged in', () => {

        it('can see total article count (whether public or private)', () => {


        });

        it('can see any article', () => {


        });

        describe('and higher level than user', () => {

            it('canEdit = true', () => {


            });
        });

        describe('not current user, and same level as current user', () => {

            it('canEdit = false', () => {


            });
        });

        describe('and current user', () => {

            it('can see notification setting', () => {


            });

            it('can see two factor setting', () => {


            });

            it('canEdit = true', () => {


            });
        });
    });
});
