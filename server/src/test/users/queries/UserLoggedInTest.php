<?php


require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class UserLoggedInTest extends UserTest {

    function testCanSeeFullArticleCount() { // both public and private

        $user = $this->TestDatabase->getRandomUser();

        $expected = count($this->TestDatabase->pageinfo);

        $data = $this->request([
           'query' => 'query users {
                           users {
                               articleCount
                           }
                       }'
        ], HelpTests::getJwt($user));

        $this->assertEqual($expected, $data['users'][0]['articleCount']);
    }

    function testLevelHigherThanOtherUserCanEdit() {

        $higherLevel = rand(2, 3);

        $user = HelpTests::searchArray($this->TestDatabase->users, function (array $currentUser) {
            return $currentUser['level'] == $higherLevel;
        });

        $data = $this->request([
            'query' => 'query users {
                            users {
                                canEdit
                            }
                        }'
        ], HelpTests::getJwt($user));

        $lowerLevelUsers = HelpTests::searchArray($data['users'], function (array $currentUser) {
            return $currentUser['level'] < $higherLevel;
        });

        $this->assertFalse(in_array(false, array_column($lowerLevelUsers, 'canEdit')));
    }

    // expects canEdit to be false, and twoFactor = notifications = null
    function testLevelSameOrLowerThanOtherUserCannotEdit() {

        $level = rand(1, 3);

        $user = HelpTests::searchArray($this->TestDatabase->users, function (array $currentUser) {
            return $currentUser['level'] == $level;
        });

        $data = $this->request([
            'query' => 'query users {
                            users {
                                canEdit,
                                notifications,
                                twoFactor
                            }
                        }'
        ], HelpTests::getJwt($user));

        $users = HelpTests::searchArray($data['users'], function (array $currentUser) {
            return $currentUser['level'] >= $higherLevel && $user['id'];
        });

        HelpTests::searchArray($this->TestDatabase->users, function (array $currentUser) {

            $this->assertFalse($currentUser['canEdit']);
            $this->assertNull($currentUser['notifications']);
            $this->assertNull($currentUser['twoFactor']);
        });
    }

    // opposite expectations of #testLevelSameOrLowerThanOtherUserCannotEdit
    function testCanSeeOwnSettings() {

        $user = $this->getRandomUser();

        $data = $this->request([
            'query' => 'query users($id: ID) {
                            users(id: $id) {
                                notifications
                                twoFactor
                                canEdit
                            }
                        }',
            'variables' => [
                'id' => $user['id']
            ]
        ]);

        $actualUser = $data['users'][0];

        $this->assertTrue($actualUser['canEdit']);
        $this->assertEqual($user['notifications'], $actualUser['notifications']);
        $this->assertEqual($user['two_fa_enabled'], $actualUser['twoFactor']);
    }
}







?>