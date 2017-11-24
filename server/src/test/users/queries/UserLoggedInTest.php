<?php


require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class UserLoggedInTest extends UserTest {

    function testCanSeeFullArticleCount() { // both public and private

        $user = HelpTests::faker()->randomElement($this->Database->GenerateRows->users);

        $expectedArticleCount = 0;

        foreach ($this->Database->GenerateRows->pageinfo as $article) {

            if ($article['authorid'] === $user['id']) {
                $expectedArticleCount++;
            }
        }

        $data = $this->request([
           'query' => 'query users($id: ID) {
                           users(id: $id) {
                               articleCount
                           }
                       }',
            'variables' => [
                'id' => $user['id']
            ]
        ], HelpTests::getJwt($user));

        $this->assertEquals($expectedArticleCount, $data['users'][0]['articleCount']);
    }

    function testLevelHigherThanOtherUserCanEdit() {

        $higherLevel = rand(2, 3);

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser, int $higherLevel) {
            return $currentUser['level'] == $higherLevel;
        }, $higherLevel);

        $data = $this->request([
            'query' => 'query users {
                            users {
                                canEdit
                                level
                            }
                        }'
        ], HelpTests::getJwt($user));

        $lowerLevelUsers = HelpTests::searchArray($data['users'], function (array $currentUser, int $higherLevel) {
            return $currentUser['level'] < $higherLevel;
        }, $higherLevel);

        $this->assertFalse(in_array(false, array_column($lowerLevelUsers, 'canEdit')));
    }

    // expects canEdit to be false, and twoFactor = notifications = null
    function testLevelSameOrLowerThanOtherUserCannotEdit() {

        $level = rand(1, 3);

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser, int $level) {
            return $currentUser['level'] == $level;
        }, $level);

        $data = $this->request([
            'query' => 'query users {
                            users {
                                canEdit,
                                notifications,
                                twoFactor
                                level
                                id
                            }
                        }'
        ], HelpTests::getJwt($user));

        $users = [];

        foreach ($data['users'] as $currentUser) {

            if ($currentUser['level'] >= $user['level'] && $user['id'] !== $currentUser['id']) {
                $this->assertFalse($currentUser['canEdit']);
                $this->assertFalse($currentUser['notifications']);
                $this->assertFalse($currentUser['twoFactor']);
            }
        }
    }

    // opposite expectations of #testLevelSameOrLowerThanOtherUserCannotEdit
    function testCanSeeOwnSettings() {

        $user = HelpTests::faker()->randomElement($this->Database->GenerateRows->users);

        $data = $this->request([
            'query' => 'query users($id: ID) {
                            users(id: $id) {
                                notifications
                                twoFactor
                                canEdit
                                id
                            }
                        }',
            'variables' => [
                'id' => $user['id']
            ]
        ], HelpTests::getJwt($user));

        $actualUser = $data['users'][0];

        $this->assertTrue($actualUser['canEdit']);
        $this->assertEquals($user['notifications'], $actualUser['notifications']);
        $this->assertEquals($user['two_fa_enabled'], $actualUser['twoFactor']);
    }

    function testAdminCanEditLowerLevels() {


        $loggedInUser = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {
            return $currentUser['level'] > 1;
        });

        $data = $this->request([
            'query' => 'query users {
                            users {
                                canEdit
                                level
                                id
                            }
                        }',
            'variables' => []
        ], HelpTests::getJwt($loggedInUser));

        foreach ($data['users'] as $user) {

            if ($user['level'] < $loggedInUser['level'] || $user['id'] == $loggedInUser['id']) {
                $this->assertTrue($user['canEdit']);
            } else {
                $this->assertFalse($user['canEdit']);
            }
        }
    }
}







?>