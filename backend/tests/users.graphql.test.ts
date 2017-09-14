import * as chai from 'chai';
import * as chaiHttp from 'chai-http';
import * as faker from 'faker';
import TestDatabase from './database.mock';
import app from '../app';

const Database = new TestDatabase();

before(function() {
    this.timeout(9000);
    return Database.init()
});

after(() => Database.drop());

const expect = chai.expect;

chai.use(chaiHttp);


describe('queries', () => {

    /**
     * @param args - {query: graphql_query_string, variables: graphql_variables }
     *
     * @return {Promise} resolving to array of users with data specified by query
     */
    async function request(args: {query: string, variables: {id?: string | number, profileLink?: string}}) {

        const res = await chai.request(app)
            .post('/graphql')
            .send(Object.assign(args, { operationName: 'users' }))
            .catch((err: Error) => expect(err).to.be.null(args));

        return res.res.body.data.users;
    }

    /**
     * @return random user that is in database
     */
    function getRandomUser() {

        return faker.random.arrayElement(Database.tables.values.users);
    }

    describe('work with args', () => {

        const singleUserQuery = `
            query users($profileLink: String, $id: ID) {
                users(profileLink: $profileLink, id: $id) {
                    id
                }
            }
        `;

        it('profileLink', async () => {

            const user = getRandomUser();

            const users = await request({
                query: singleUserQuery,
                variables: {
                    profileLink: user.email.split('@')[0]
                }
            });

            expect(users[0]).to.deep.equal({
                id: user.id.toString()
            });
        });

        it('id', async () => {

            const user = getRandomUser();

            const users = await request({
                query: singleUserQuery,
                variables: {
                    id: user.id
                }
            });

            expect(users[0]).to.deep.equal({
                id: user.id
            });
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
