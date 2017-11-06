<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

/**
 * Goal: Only user who posted the comment, or level 3, can delete
 */
class DeleteCommentTest extends CommentTest {

    /**
     * Runs all duplicate functionality
     *
     * @param $commentId - comment to delete
     * @param $user - user who will be doing the deleting
     * @param $loggedIn - if $user is logged in
     *
     * @return result of mutation
     */
    protected function helpTest(array $comment, array $user, bool $loggedIn = true) {

        $user = HelpTests::faker()->randomElement($this->Database->GenerateRows->users);

        return $this->request([
            'query' => 'mutation CommentDelete($id: ID!) {
                            deleteComment(id: $id) {
                                id
                            }
                        }',
            'variables' => [
                'id' => $comment['id']
            ]
        ], $loggedIn ? HelpTests::getJwt($user) : '');
    }

    protected function helpCheckCommentExists(array $comment, bool $assertExists = true) {

        $commentExists = Db::query("SELECT id FROM comments WHERE id = ?", [$comment['id']])->fetchColumn();

        if ($assertExists) {
            $this->assertNotNull($commentExists);
        } else {
            $this->assertFalse($commentExists);
        }
    }

    function testBadNotLoggedIn() {

        $commentToDelete = HelpTests::faker()->randomElement($this->Database->GenerateRows->comments);

        $this->helpTest($commentToDelete, [], false);

        $this->helpCheckCommentExists($commentToDelete);
    }

    function testBadNotAuthorNotLevelThree() {

        $commentToDelete = HelpTests::faker()->randomElement($this->Database->GenerateRows->comments);

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser, $commentToDelete) {
            return $currentUser['level'] < 3 && $currentUser['id'] !== $commentToDelete['id'];
        }, $commentToDelete);

        $this->helpTest($commentToDelete, $user);

        $this->helpCheckCommentExists($commentToDelete);
    }

    function testGoodAuthor() {

        $getUserComment = function(array $user) {

            return HelpTests::searchArray($this->Database->GenerateRows->comments, function (array $currentComment, array $user) {
                return $user['id'] === $currentComment['authorid'];
            }, $user);
        };

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser, callable $getUserComment) {

            if ($currentUser['level'] > 2) {
                return false;
            }

            $userComment = $getUserComment($currentUser);

            $commentToDelete = $userComment;

            $userHasAtLeastOneComment = !!$userComment;
            return $userHasAtLeastOneComment;
        }, $getUserComment);

        $commentToDelete = $getUserComment($user);

        $this->helpTest($commentToDelete, $user);

        $this->helpCheckCommentExists($commentToDelete);
    }

    function testGoodLevelThree() {

        $commentToDelete;

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {

            return $currentUser['level'] > 2;
        });

        $commentToDelete = HelpTests::searchArray($this->Database->GenerateRows->comments, function (array $currentComment, array $user) {
            return $user['id'] !== $currentComment['authorid'];
        }, $user);

        $this->helpTest($commentToDelete, $user);

        $this->helpCheckCommentExists($commentToDelete);
    }
}
?>