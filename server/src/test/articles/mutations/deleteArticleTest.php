<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class DeleteArticleTest extends ArticleTest {

    function helpTest(bool $author = false, int $level = 3, bool $loggedIn = true, bool $correctPassword = true) {

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser, $level) {

            $isAnAuthor = HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle, $currentUser) {
                return $currentArticle['authorid'] == $currentUser['id'];
            }, $currentUser);

            return $currentUser['level'] == $level && $isAnAuthor;

        }, $level);

        $article = HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle, $info) {

            $userIsAuthor = $currentArticle['authorid'] == $info['user']['id'];
            return $info['author'] ? $userIsAuthor : !$userIsAuthor;

        }, ['author' => $author, 'user' => $user]);

        return $this->request([
            'query' => 'mutation deleteArticles($ids: [ID], $password: String) {
                            deleteArticles(ids: $ids, password: $password) {
                                id
                            }
                        }',
            'variables' => [
                'ids' => [$article['id']],
                'password' => $correctPassword ? $user['password'] : $user['password'] . HelpTests::faker()->text()
            ]
        ], $loggedIn ? HelpTests::getJwt($user) : null);

    }

    function testNotLevelThreeNotOwnerCannotDelete() {
        $this->assertNull($this->helpTest(false, rand(1, 2))['deleteArticles']);
    }

    function testOwnerCanDeleteArticle() {
        $this->assertNotNull($this->helpTest(true, rand(1, 2))['deleteArticles']);
    }

    function testLevelThreeCanDeleteArticle() {
        $this->assertNotNull($this->helpTest(false, 3)['deleteArticles']);
    }

    function testCannotUseIncorrectPassword() {
        $this->assertNull($this->helpTest(false, 3, true, false)['deleteArticles']);
    }
}
?>