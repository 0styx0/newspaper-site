<?php


require_once("../vendor/autoload.php");

class UserQueryArgsTest extends UserTest {

    function testProfileLinkArg() {

        $user = HelpTests::getRandomUser();

        $users = $this->request([
            'query' => $this->userExistsQuery,
            'variables' => [
                'profileLink' => explode('@', $user['email'])[0]
            ]
        ]);

        $this->assertEquals($users[0]['id'], $user['id']);
    }

    function testIdArg() {

        $user = HelpTests::getRandomUser();

        $users = $this->request([
            'query' => $this->userExistsQuery,
            'variables' => [
                'id' => $user['id']
            ]
        ]);

        $this->assertEquals($users[0]['id'], $user['id']);
    }

    function testNoArgs() {

        $users = $this->request([
           'query' => $this->userExistsQuery
        ]);

        TestDatabase::users
    }



    /*
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
    */
}







?>