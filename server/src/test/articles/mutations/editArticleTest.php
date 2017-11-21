<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class EditArticleTest extends ArticleTest {

    protected function helpTestUpdate(bool $public = false, string $newArticle, bool $loggedIn = true, bool $author = false, int $level = 1, bool $correctPassword = true) {

        $articleToUpdate = HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle, array $options) {

            $articleIsPublic = $currentArticle['issue'] != $options['privateIssue'];

           return $options['articleShouldBePublic'] ? $articleIsPublic : !$articleIsPublic;

        }, ['articleShouldBePublic' => $public, 'privateIssue' => $this->Database->GenerateRows->issues[0]['num']]);

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser, array $scopedVars) {

           if ($scopedVars['author']) {
               return $currentUser['id'] == $scopedVars['articleToUpdate']['authorid'];
           }
           else if ($currentUser['level'] == $scopedVars['level']) {
               return true;
           }

           return false;
        }, ['author' => $author, 'articleToUpdate' => $articleToUpdate, 'level' => $level]);


        return $this->request([
            'query' => 'mutation EditArticle($id: ID, $article: String) {
                            editArticle(id: $id, article: $article) {
                                article
                            }
                        }',
            'variables' => [
                'article' => $newArticle,
                'id' => $articleToUpdate['id']
            ]
        ], $loggedIn ? HelpTests::getJwt($user) : null);
    }
    
    function testNotLoggedInCannotEditAnyText() {

        $newArticle = $this->Database->GenerateRows->pageinfo();

        $data = $this->helpTestUpdate(false, $newArticle['lede'] . $newArticle['body'], false);

        $this->assertNull($data['editArticle']);
    }

    function testCanEditOwnArticleText() {

        $newArticle = $this->Database->GenerateRows->pageinfo();

        $data = $this->helpTestUpdate(false, $newArticle['lede'] . $newArticle['body'], true, true);

        $this->assertNotNull($data['editArticle']);
    }

    function testCanEditAnyArticleTextIfLevelGreaterThanTwo() {

        $newArticle = $this->Database->GenerateRows->pageinfo();

        $data = $this->helpTestUpdate(true, $newArticle['lede'] . $newArticle['body'], true, false, 3);

        $this->assertNotNull($data['editArticle']);
    }
}
?>