<?php


require_once(__DIR__ . '/../../../vendor/autoload.php');
require_once(__DIR__ . '/helpers.php');

class UserQueryArgsTest extends UserTest {

    private $TestDatabase;

    protected function setup() {

        $this->TestDatabase = new TestDatabase();
        $this->TestDatabase->init();
    }

    function testProfileLinkArg() {

        $user = $this->TestDatabase->getRandomUser();

        $data = $this->request([
            'query' => 'query users($profileLink: String) {
                                users(profileLink: $profileLink) {
                                id
                            }
                        }',
            'variables' => [
                'profileLink' => HelpTests::getProfileLink($user['email']),
            ]
        ]);

        $this->assertEquals($user['id'], $data['users'][0]['id']);
        $this->assertEquals(1, count($data['users']));
    }

    function testIdArg() {

        $user = $this->TestDatabase->getRandomUser();

        $data = $this->request([
            'query' => 'query users($id: ID) {
                                users(id: $id) {
                                id
                            }
                        }',
            'variables' => [
                'id' => $user['id']
            ]
        ]);

        $this->assertEquals($user['id'], $data['users'][0]['id']);
        $this->assertEquals(1, count($data['users']));
    }

    function testNoArgsGetAllUsers() {

        $data = $this->request([
           'query' => 'query users {
                                users {
                                id
                            }
                        }'
        ]);

        $expected = array_column($this->TestDatabase->GenerateRows->users, 'id');
        $actual = array_column($data['users'], 'id');

        $HelpTests = new HelpTests();
        $HelpTests->compareArrayContents($expected, $actual);
    }

    /**
     * Checks if can get $attribute when not logged in
     *
     * @param $attribute - graphql field
     */
    private function helperTestNotLoggedIn(string $attribute) {

        $user = HelpTests::searchArray($this->TestDatabase->GenerateRows->users, function (array $user) {
            return $user['level'] == 3;
        });

        $data = $this->request([
            'query' => "query users(\$id: ID) {
                            users(id: \$id) {
                                {$attribute}
                            }
                        }",
            'variables' => [
                'id' => $user['id']
            ]
        ]);

        $this->assertNull($data['users'][0][$attribute]);
    }

    function testNotLoggedInCannotGetPassword() {

        $this->helperTestNotLoggedIn('password');
    }

    function testNotLoggedInCannotGetUsername() {

        $this->helperTestNotLoggedIn('username');
    }

    function testNotLoggedInCannotGetNotificationSetting() {

        $this->helperTestNotLoggedIn('notifications');
    }

    function testNotLoggedInCannotGetTwoFactor() {

        $this->helperTestNotLoggedIn('twoFactor');
    }


    function testNotLoggedInGetOnlyPublicArticleCount() {

        $user = HelpTests::searchArray($this->TestDatabase->GenerateRows->users, function (array $user) {
            return $user['level'] == 3;
        });


    }

    /*
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