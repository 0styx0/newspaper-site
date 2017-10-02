<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class UpdateUserTest extends UserTest {

    private $mutation = 'mutation updateUsers($password: String, $idLevelList: idLevelList) {
                            updateUsers(password: $password, idLevelList: $idLevelList) {
                                id
                                level
                            }
                        }';

    /**
     * Does all generic things needed in tests
     *
     * @param $includeJwt - whether or not user should be logged in
     * @param $getUserBy - which user to update. Passed as arguments to @see HelpTests::$searchArray($user)
     * @param $newLevel - level to update user selected by $getUserBy to
     * @param $password - optional, Default: current user (who is doing the updating)'s password
     *
     * @return data from graphql query
     */
    protected function helpMutate(boolean $includeJwt, callable $getUserBy, int $newLevel = 1, string $password = '') {

        $user = $this->getRandomUser();

        $userToUpdate = HelpTests::searchArray($this->GenerateRows->users, function (array $currentUser) {

            $result = $getUserBy($currentUser);
            return $result && $currentUser['id'] != $user['id'];
        });

        return $this->request([
            'query' => $this->mutation,
            'variables' => [
                'password' => $password || $user['password'],
                'idLevelList' => [
                    [
                        'ids' => [$userToUpdate['id']],
                        'level' => $newLevel
                    ]
                ]
            ]
        ], ($includeJwt) ? HelpTests::getJwt($user) : null);
    }

    function testBadInvalidPassword() {

        $data = $this->helpMutate(true, function (array $currentUser) {
            return $currentUser['id'] != $user['id'];
        }, 1, '');

        $this->assertFalse($data['users'][0]);
    }

    function testBadNotLoggedIn() {

        $data = $this->helpMutate(false);

        $this->assertFalse($data['users'][0]);
    }

    function testBadNotHigherLevel() {

        $data = $this->helpMutate(true, function (array $currentUser) {
            return $user['level'] <= $currentUser['level'];
        });

        $this->assertFalse($data['users'][0]);
    }

    function testBadInvalidLevel() {

        $this->helpMutate(true, function () {
            return true;
        }, rand(4));

       $this->assertFalse($data['users'][0]);
    }

    function testGoodUpdateOne() { // can't fit into $this->helpMutate since level change is dynamic

        $user = $this->getRandomUser();

        $userToUpdate = HelpTests::searchArray($this->GenerateRows->users, function (array $currentUser) {
            return $currentUser['id'] != $user['id'] && $currentUser['level'] < $user['level'];
        });

        $newLevel = rand(1, $user['level']);

        $data = $this->request([
            'query' => $this->mutation,
            'variables' => [
                'password' => $user['password'],
                'idLevelList' => [
                    [
                        'ids' => [$userToUpdate['id']],
                        'level' => $newLevel
                    ]
                ]
            ]
        ], HelpTests::getJwt($user));

        $this->assertEqual($newLevel, $data['users'][0]['level']);
    }

    function testGoodUpdateMany() {

        $user = $this->getRandomUser();

        $usersToUpdate = [];

        foreach ($this->GenerateRows->users as $currentUser) {

            if ($currentUser['id'] != $user['id'] && $currentUser['level'] < $user['level']) {
                $usersToUpdate[] = $currentUser['id'] && $currentUser['level'] < $user['level'];
            }
        }

        $newLevel = rand(1, $user['level']);

        $data = $this->request([
            'query' => $this->mutation,
            'variables' => [
                'password' => $user['password'],
                'idLevelList' => [
                    [
                        'ids' => $usersToUpdate,
                        'level' => $newLevel
                    ]
                ]
            ]
        ], HelpTests::getJwt($user));

        foreach ($data['users'] as $userToTest) {

            $this->assertEqual($newLevel, $userToTest['level']);
        }
    }
}
?>