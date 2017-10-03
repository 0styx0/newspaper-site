<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class UpdateArticleTest extends ArticleTest {

    /**
     *
     * @param $findArticle - function to filter articles by. @see HelpTests::searchArray param $qualifier
     * @param $fieldToChange - what to update
     */
    protected function helpTestUpdate(callable $findArticle, string $fieldToChange, $newValue, bool $loggedIn = true, bool $author = false, int $level = 1, bool $correctPassword = true) {

        $articleToUpdate = HelpTests::searchArray($this->Database->GenerateRows->pageinfo, $findArticle);

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {

           if ($author) {

               return $currentUser['id'] == $articleToUpdate['authorid'];
           } else if ($currentUser['level'] == $level) {

               return true;
           }

           return false;
        });

        $newData = [
                    'id' => $articleToUpdate['id'],
                    'tags' => $articleToUpdate['tags'],
                    'displayOrder' => $articleToUpdate['display_order'],
                    'article' => $articleToUpdate['lede'] . $articleToUpdate['body']
                    ];

        $newData[$fieldToChange] = $newValue;

        return $this->request([
            'query' => 'mutation ArticleUpdate($data: [Fields], $password: String) {
                            updateArticles(data: $data, password: $password) {
                                id
                                tags
                                displayOrder
                            }
                        }',
            'variables' => [
                'data' => $newData,
                'password' => $user['password']
            ]
        ], $loggedIn ? HelpTests::getJwt($user) : null);
    }

    function testNotLoggedInCannotEditAnyText() {

        $newArticle = $this->Database->GenerateRows->pageinfo();

        $data = $this->helpTestUpdate(function () {
            return true;
        }, 'article', $newArticle['lede'] . $newArticle['body'], false);

        $this->assertNull($data['articles']);
    }

    function testNotLoggedInCannotEditDisplayOrder() {

        $newArticle = $this->Database->GenerateRows->pageinfo();

        $data = $this->helpTestUpdate(function () {
            return true;
        }, 'displayOrder', $newArticle['display_order'], false);

        $this->assertNull($data['articles']);
    }

    function testNotLoggedInCannotEditTags() {

        $newTags = HelpTests::$faker()->randomElements($this->Database->GenerateRows->tag_list);

        $data = $this->helpTestUpdate(function () {
            return true;
        }, 'tags', $newTags, false);

        $this->assertNull($data['articles']);
    }

    function testCanEditOwnArticleText() {

        $newArticle = $this->Database->GenerateRows->pageinfo();

        $data = $this->helpTestUpdate(function () {
            return true;
        }, 'article', $newArticle['lede'] . $newArticle['body'], true, true);

        $this->assertNotNull($data['articles']);
    }

    function testCanEditAnyArticleTextIfLevelGreaterThanTwo() {

        $newArticle = $this->Database->GenerateRows->pageinfo();

        $data = $this->helpTestUpdate(function () {
            return true;
        }, 'article', $newArticle['lede'] . $newArticle['body'], true, false, 3);

        $this->assertNotNull($data['articles']);
    }

    function testCannotEditIfWrongPassword() {

        $newArticle = $this->Database->GenerateRows->pageinfo();

        $data = $this->helpTestUpdate(function () {
            return true;
        }, 'article', $newArticle['lede'] . $newArticle['body'], true, false, 3, false);

        $this->assertNotNull($data['articles']);
    }

    function testLevelThreeCanModifyDisplayOrder() {

        $newArticle = $this->Database->GenerateRows->pageinfo();

        $data = $this->helpTestUpdate(function () {
            return true;
        }, 'displayOrder', $newArticle['display_order'], true, false, 3);

        $this->assertNotNull($data['articles']);
    }

    function testLevelThreeCanModifyTags() {

        $newTags = HelpTests::faker()->randomElements($this->Database->GenerateRows->tag_list());

        $data = $this->helpTestUpdate(function () {
            return true;
        }, 'tags', $newTags, true, false, 3);

        $this->assertNotNull($data['articles']);
    }
}
?>