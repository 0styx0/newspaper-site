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

            const user = faker.random.arrayElement(Database.tables.values.users);

            chai.request(app)
            .post('/graphql')
            .send({query, variables: { profileLink: user.email.split('@')[0]}, operationName: 'users'})
            .end(async (err, res) => {


                expect(err).to.be.null;
                expect(res).to.have.status(200);

                console.log('73: res.body', ((await res).body.data.users[0]));

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
