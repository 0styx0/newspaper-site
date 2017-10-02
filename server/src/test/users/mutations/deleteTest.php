<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class DeleteUserTest extends UserTest {

    /**
     * Does all generic things needed in tests
     *
     * @param $canDeleteUser - function (array $currentUser, array $user) => boolean. True if $currentUser should be deleted
     * @param $useCorrectPassword - whether to use correct password
     * @param $loggedIn - if current user is logged in while trying to delete someone
     */
    protected function helpMutate(callable $canDeleteUser, bool $useCorrectPassword = true, bool $loggedIn = true) {

        $user = $this->getRandomUser();
        $userToDelete = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {
            return $canDeleteUser($currentUser, $user);
        });

        return $this->request([
           'query' => 'mutation deleteUsers($ids: [ID], $password: String) {
                           deleteUsers(ids: $ids, password: $password) {
                               id
                           }
                       }',
            'variables' => [
                'ids' => [$userToDelete['id']],
                'password' => $useCorrectPassword ? $userToDelete['password'] : $userToDelete['password'] . rand()
            ]
        ]);
    }

    /**
     * Asserts user doesn't exist
     *
     * @param $user - result of graphql deleteUsers mutation
     */
    protected function assertUserDoesNotExist(array $user) {

        $userExists = $Db::query("SELECT 1 FROM users WHERE id = ?", [$data['users'][0]['id']])->fetchColumn();

        $this->assertFalse($userExists);
    }

    /**
     * Same param as #assertUserDoesNotExist, but asserts opposite
     */
    protected function assertUserExists(array $user) {

        $userExists = $Db::query("SELECT 1 FROM users WHERE id = ?", [$data['users'][0]['id']])->fetchColumn();

        $this->assertTrue($userExists);
    }

    function testBadDeleteHigherOrEqualLevel() {

        $data = $this->helpMutate(function (array $currentUser, array $user) {
            return $currentUser['id'] != $user['id'] && $currentUser['level'] >= $user['level'];
        });

        $this->assertUserDoesNotExist($data);
    }

    function testBadDeleteNotLoggedIn() {

        $data = $this->helpMutate(function (array $currentUser, array $user) {
            return $currentUser['id'] != $user['id'] && $currentUser['level'] < $user['level'];
        }, true, false);

        $this->assertUserExists($data);
    }

    function testBadDeleteIncorrectPassword() {

        $data = $this->helpMutate(function (array $currentUser, array $user) {
            return $currentUser['id'] != $user['id'] && $currentUser['level'] < $user['level'];
        }, false);

        $this->assertUserExists($data);
    }

    function testCanDeleteOwnAccount() {

        $data = $this->helpMutate(function (array $currentUser, array $user) {
            return $currentUser['id'] == $user['id'];
        });

        $this->assertUserDoesNotExist($data);
    }

    function testCanDeleteLowerLevels() {

        $data = $this->helpMutate(function (array $currentUser, array $user) {
            return $currentUser['level'] < $user['level'];
        }, false);

        $this->assertUserDoesNotExist($data);
    }
}

?>