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
    protected function helpTest(string $commentId, array $user, bool $loggedIn = true) {

        $user = HelpTests::faker()->randomElement($this->Database->GenerateMockRows->users);

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

        $commentExists = Db::query("SELECT id FROM comments WHERE id = ?", [$commentToDelete['id']])->fetchColumn();

        if ($assertExists) {
            $this->assertTrue($commentExists);
        } else {
            $this->assertFalse($commentExists);
        }
    }

    function testBadNotLoggedIn() {

        $commentToDelete = $this->faker()->randomElement($this->Database->GenerateRows->comments);

        $this->helpTest($commentToDelete, [], false);

        $this->helpCheckCommentExists($commentToDelete);
    }

    function testBadNotAuthorNotLevelThree() {

        $commentToDelete = $this->faker()->randomElement($this->Database->GenerateRows->comments);

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {
            return $currentUser['level'] < 3 && $currentUser['id'] !== $commentToDelete['id'];
        });

        $this->helpTest($commentToDelete, $user);

        $this->helpCheckCommentExists($commentToDelete);
    }

    function testGoodAuthor() {

        $commentToDelete;

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {

            if ($currentUser['level'] > 2) {
                return false;
            }

            $userComment = HelpTests::searchArray($this->Database->GenerateRows->comments, function (array $currentComment) {
                return $user['id'] === $currentComment['authorid'];
            });

            $commentToDelete = $userComment;

            $userHasAtLeastOneComment = !!$userComment;
            return $userHasAtLeastOneComment;
        });

        $this->helpTest($commentToDelete, $user);

        $this->helpCheckCommentExists($commentToDelete);
    }

    function testGoodLevelThree() {

        $commentToDelete;

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {

            if ($currentUser['level'] < 2) {
                return false;
            }

            $commentToDelete = HelpTests::searchArray($this->Database->GenerateRows->comments, function (array $currentComment) {
                return $user['id'] !== $currentComment['authorid'];
            });

            return true;
        });

        $this->helpTest($commentToDelete, $user);

        $this->helpCheckCommentExists($commentToDelete);
    }
}
?>