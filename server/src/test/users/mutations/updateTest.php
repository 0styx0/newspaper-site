<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class UpdateUserTest extends UserTestHelper {

    private $mutation = 'mutation updateUsers($password: String, $data: idLevelList) {
                            updateUsers(password: $password, data: $data) {
                                id
                                level
                            }
                        }';

    protected function getUserOfLevel(int $level) {

        return TestHelper::searchArray($this->Database->GenerateRows->users, function ($currentUser, $level) {
            return $currentUser['level'] > $level;
        }, $level);
    }

    /**
     * Does all generic things needed in tests
     *
     * @param $includeJwt - whether or not user should be logged in
     * @param $getUserBy - which user to update. Passed as arguments to @see TestHelper::$searchArray($user)
     * @param $newLevel - level to update user selected by $getUserBy to
     * @param $password - optional, Default: current user (who is doing the updating)'s password
     *
     * @return data from graphql query
     */
    protected function helpMutate(bool $includeJwt, callable $getUserBy, int $newLevel = 1, string $password = '') {

        $user = $this->getUserOfLevel(1);

        $userToUpdate = TestHelper::searchArray($this->Database->GenerateRows->users, function (array $currentUser, $outsideVars) {

            $result = $outsideVars['getUserBy']($currentUser, $outsideVars['user']);
            return $result && $currentUser['id'] != $outsideVars['user']['id'];
        }, ['getUserBy' => $getUserBy, 'user' => $user]);

        return $this->request([
            'query' => $this->mutation,
            'variables' => [
                'password' => $password || $user['password'],
                'data' => [
                    [
                        'ids' => [$userToUpdate['id']],
                        'level' => $newLevel
                    ]
                ]
            ]
        ], ($includeJwt) ? TestHelper::getJwt($user) : null);
    }

    function testBadInvalidPassword() {

        $data = $this->helpMutate(true, function (array $currentUser, array $user) {
            return $currentUser['id'] < $user['id'];
        }, 1, '');

        $this->assertEmpty($data['updateUsers'][0]);
    }

    function testBadNotLoggedIn() {

        $data = $this->helpMutate(false, function ($currentUser, $user) {
            return $currentUser['id'] < $user['id'];
        });

        $this->assertEmpty($data['updateUsers'][0]);
    }

    function testBadNotHigherLevel() {

        $data = $this->helpMutate(true, function (array $currentUser, array $user) {
            return $user['level'] <= $currentUser['level'];
        });

        $this->assertEmpty($data['updateUsers'][0]);
    }

    function testBadInvalidLevel() {

        $data = $this->helpMutate(true, function (array $currentUser, array $user) {
            return $currentUser['id'] < $user['id'];
        }, 7); // 7 = random

       $this->assertEmpty($data['updateUsers'][0]);
    }

    function testGoodUpdateOne() { // can't fit into $this->helpMutate since level change is dynamic

        $user = $this->getUserOfLevel(1);

        $userToUpdate = TestHelper::searchArray($this->Database->GenerateRows->users, function (array $currentUser, array $user) {
            return $currentUser['id'] != $user['id'] && $currentUser['level'] < $user['level'];
        }, $user);

        $newLevel = rand(1, $user['level']);

        $data = $this->request([
            'query' => $this->mutation,
            'variables' => [
                'password' => $user['password'],
                'data' => [
                    [
                        'ids' => [$userToUpdate['id']],
                        'level' => $newLevel
                    ]
                ]
            ]
        ], TestHelper::getJwt($user));

        $this->assertEquals($newLevel, $data['updateUsers'][0]['level']);
    }

    function testGoodUpdateMany() {

        $user = $this->getUserOfLevel(1);

        $usersToUpdate = [];

        foreach ($this->Database->GenerateRows->users as $currentUser) {

            if ($currentUser['id'] != $user['id'] && $currentUser['level'] < $user['level']) {
                $usersToUpdate[] = $currentUser['id'] && $currentUser['level'] < $user['level'];
            }
        }

        $newLevel = rand(1, $user['level']);

        $data = $this->request([
            'query' => $this->mutation,
            'variables' => [
                'password' => $user['password'],
                'data' => [
                    [
                        'ids' => $usersToUpdate,
                        'level' => $newLevel
                    ]
                ]
            ]
        ], TestHelper::getJwt($user));

        foreach ($data['updateUsers'] as $userToTest) {

            $this->assertEquals($newLevel, $userToTest['level']);
        }
    }
}
?>