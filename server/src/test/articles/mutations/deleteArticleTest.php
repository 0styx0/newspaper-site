<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class DeleteArticleTest extends ArticleTest {

    function helpTest(bool $author = false, int $minLevel = 1, bool $loggedIn = true, bool $correctPassword = true) {

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser, $minLevel) {

            $isAnAuthor = HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle, $currentUser) {
                return $currentArticle['authorid'] == $currentUser['id'];
            }, $currentUser);

            return $currentUser['level'] >= $minLevel && $isAnAuthor;

        }, $minLevel);

        $articleId = HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle, $info) {

            return $info['author'] && $currentArticle['authorid'] == $info['user']['id'];
        }, ['author' => $author, 'user' => $user]);


        return $this->request([
            'query' => 'mutation deleteArticles($ids: [ID]) {
                            deleteArticles(ids: $ids) {
                                id
                            }
                        }',
            'variables' => [
                'ids' => [$articleId],
                'password' => $correctPassword ? $user['password'] : $user['password'] . HelpTests::faker()->randomWord()
            ]
        ]);

    }

    function testNotLevelThreeNotOwnerCannotDelete() {
        $this->assertNull($this->helpTest()['deleteArticles']);
    }

    function testOwnerCanDeleteArticle() {
        $this->assertNotNull($this->helpTest(true)['deleteArticles']);
    }

    function testLevelThreeCanDeleteArticle() {
        $this->assertNotNull($this->helpTest(false, 3)['deleteArticles']);
    }

    function testCannotUseIncorrectPassword() {
        $this->assertNull($this->helpTest(false, 3, true, false)['deleteArticles']);
    }
}
?>