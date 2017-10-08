<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class DeleteArticleTest extends ArticleTest {

    function helpTest(bool $author = false, int $minLevel = 1, bool $loggedIn = true, bool $correctPassword = true) {

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {

            $isAnAuthor = HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle) {
                $currentArticle['authorid'] == $currentUser['id'];
            });

            if ($currentUser['level'] >= $minLevel && $isAnAuthor) {
                return true;
            }

            return false;
        });

        $articleId = HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle) {

            if ($author && $currentArticle['authorid'] == $user['id']) {
                return true;
            }

            return false;
        });

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
        $this->assertNull($this->helpTest()['articles']);
    }

    function testOwnerCanDeleteArticle() {
        $this->assertNotNull($this->helpTest(true)['articles']);
    }

    function testLevelThreeCanDeleteArticle() {
        $this->assertNotNull($this->helpTest(false, 3)['articles']);
    }

    function testCannotUseIncorrectPassword() {
        $this->assertNull($this->helpTest(false, 3, true, false)['articles']);
    }
}
?>