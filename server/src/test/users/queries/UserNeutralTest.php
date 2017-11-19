<?php

// whether logged in or not, same behavior expected

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class UserNeutralTest extends UserTest {

    function testProfileLinkArg() {

        $user = $this->Database->getRandomUser();

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

        $user = $this->Database->getRandomUser();

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

        $expected = array_column($this->Database->GenerateRows->users, 'id');
        $actual = array_column($data['users'], 'id');

        $HelpTests = new HelpTests();
        $HelpTests->compareArrayContents($expected, $actual);
    }

    function testCanGetViews() {

        $data = $this->request([
           'query' => 'query users {
                                users {
                                    views
                            }
                        }'
        ]);

        $userViewsExpected = [];


        foreach ($this->Database->GenerateRows->users as $user) {
            $userViewsExpected[$user['id']] = 0;
        }

        // makes $userViewsExpected into assoc array where userId => total_views
        foreach ($this->Database->GenerateRows->pageinfo as $article) {

            $userViewsExpected[$article['authorid']] += $article['views'];
        }


        $actual = array_column($data['users'], 'views');

        $HelpTests = new HelpTests();
        $HelpTests->compareArrayContents($userViewsExpected, $actual);
    }
}