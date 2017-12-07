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
    protected function helpMutate(callable $canDeleteUser, bool $useCorrectPassword = true, bool $loggedIn = true, int $userLevel = null) {

        if (!$userLevel) {

            $user = HelpTests::faker()->randomElement($this->Database->GenerateRows->users);
        } else {
            $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser, $userLevel) {
                return $currentUser['level'] == $userLevel;
            }, $userLevel);
        }

        $userToDelete = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser, $outsideVars) {
            return $outsideVars['canDeleteUser']($currentUser, $outsideVars['user']);
        }, ['canDeleteUser' => $canDeleteUser, 'user' => $user]);

        $data = $this->request([
           'query' => 'mutation deleteUsers($ids: [ID], $password: String) {
                           deleteUsers(ids: $ids, password: $password) {
                               id
                           }
                       }',
            'variables' => [
                'ids' => [$userToDelete['id']],
                'password' => $useCorrectPassword ? $user['password'] : $user['password'] . rand()
            ]
        ], $loggedIn ? HelpTests::getJwt($user) : '')['deleteUsers'];

        return ['data' => $data, 'userToDelete' => $userToDelete];
    }

    /**
     * Asserts user doesn't exist
     *
     * @param $user - result of graphql deleteUsers mutation
     */
    protected function assertUserDoesNotExist(array $data) {

        $userExists = !!Db::query("SELECT 1 FROM users WHERE id = ?", [$data['id']])->fetchColumn();

        $this->assertFalse($userExists);
    }

    /**
     * Same param as #assertUserDoesNotExist, but asserts opposite
     */
    protected function assertUserExists(array $data) {

        $userExists = !!Db::query("SELECT 1 FROM users WHERE id = ?", [$data['id']])->fetchColumn();

        $this->assertTrue($userExists);
    }

    function testBadDeleteHigherOrEqualLevel() {

        $data = $this->helpMutate(function (array $currentUser, array $user) {
            return $currentUser['id'] != $user['id'] && $currentUser['level'] >= $user['level'];
        });

        $this->assertUserExists($data['userToDelete']);
    }

    function testBadDeleteNotLoggedIn() {

        $data = $this->helpMutate(function (array $currentUser, array $user) {
            return $currentUser['id'] != $user['id'] && $currentUser['level'] < $user['level'];
        }, true, false, rand(2, 3));

        $this->assertUserExists($data['userToDelete']);
    }

    function testBadDeleteIncorrectPassword() {

        $data = $this->helpMutate(function (array $currentUser, array $user) {
            return $currentUser['id'] != $user['id'] && $currentUser['level'] < $user['level'];
        }, false, true, rand(2, 3));

        $this->assertUserExists($data['userToDelete']);
    }

    function testCanDeleteOwnAccount() {

        $data = $this->helpMutate(function (array $currentUser, array $user) {
            return $currentUser['id'] == $user['id'];
        });

        $this->assertUserDoesNotExist($data['userToDelete']);
    }

    function testCanDeleteLowerLevels() {

        $data = $this->helpMutate(function (array $currentUser, array $user) {
            return $currentUser['level'] < $user['level'];
        }, true, true, rand(2, 3));

        $this->assertUserDoesNotExist($data['userToDelete']);
    }

    function testDeletedUsersArticlesGoToDeletedUser() {

        $data = $this->helpMutate(function (array $currentUser, array $user) {

            $userIsAnAuthor = HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function ($currentArticle, $authorId) {
                return $currentArticle['authorid'] === $authorId;
            }, $currentUser['id']);

            return $currentUser['level'] < $user['level'] && $userIsAnAuthor;
        }, true, true, 3);

        $articleOfDeletedUser = HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle, string $authorId) {
            return $currentArticle['authorid'] === $authorId;
        }, $data['userToDelete']['id']);

        $usernameOfAuthor = Db::query("SELECT username
            FROM users
            JOIN pageinfo ON users.id = pageinfo.authorid
            WHERE pageinfo.id = ?
            LIMIT 1", [$articleOfDeletedUser['id']])->fetchColumn();

        $this->assertUserDoesNotExist($data['userToDelete']);
        $this->assertEquals('deleted', $usernameOfAuthor);

    }
}

?>