import * as chai from 'chai';
import * as chaiHttp from 'chai-http';
import * as faker from 'faker';
import TestDatabase from './database.mock';
import { User } from './database.mock';
import app from '../app';
import { setJWT, jwt } from '../src/helpers/jwt';

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
     * Sends graphql request
     *
     * @param args - {query: graphql_query_string, variables: graphql_variables }
     */
    async function request(
        args: {query: string, variables?: {id?: string | number, profileLink?: string}},
        jwt?: string
     ): Promise<User[]> {

        const req = chai.request(app)
            .post('/graphql');

        if (jwt) {
            req.set('Authorization', `Bearer: ${jwt}`);
        }

        const res = await req.send(Object.assign(args, { operationName: 'users' }));

        return res && res.res.body.data.users;
    }

    /**
     * @return random user that is in database
     */
    function getRandomUser() {

        return faker.random.arrayElement(Database.tables.values.users);
    }

    const userExistsQuery = `
        query users($profileLink: String, $id: ID) {
            users(profileLink: $profileLink, id: $id) {
                id
            }
        }
    `;

    describe('work with args', () => {

        it('profileLink', async () => {

            const user = getRandomUser();

            const users = await request({
                query: userExistsQuery,
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
                query: userExistsQuery,
                variables: {
                    id: user.id
                }
            });

            expect(users[0]).to.deep.equal({
                id: user.id
            });
        });
    });

    it('gets all users if no args', async () => {

        const users = await request({query: userExistsQuery});

        expect(users.map(user => user.id)).to.have.members(Database.tables.values.users.map(user => user.id));
    });

    describe('when not logged in as current user, cannot access', () => {

        let jwt: string;
        let currentUser: User;

        before(() => {

            // setting level to 3 to make sure info is or isn't sent based totally on if current user
            const user = JSON.parse(JSON.stringify(Database.tables.values.users.find(user => user.level == 3)));
            currentUser = user;

            user.profileLink = user.email.split('@')[0];

            jwt = setJWT(user);
        });

        it('password', async () => {

            const userPasswordQuery = `
                query users($profileLink: String, $id: ID) {
                    users(profileLink: $profileLink, id: $id) {
                        password
                    }
                }
            `;

            const users = await request({
                query: userPasswordQuery,
                variables: {
                    id: currentUser.id
                }
            }, jwt).catch(e => {
                expect(e).to.not.be.empty;
            });

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
