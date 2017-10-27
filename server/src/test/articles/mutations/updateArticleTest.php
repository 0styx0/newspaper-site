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

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser, array $scopedVars) {

           if ($scopedVars['author']) {
               return $currentUser['id'] == $scopedVars['articleToUpdate']['authorid'];

           } else if ($currentUser['level'] == $scopedVars['level']) {

               return true;
           }

           return false;
        }, ['author' => $author, 'articleToUpdate' => $articleToUpdate, 'level' => $level]);


        $articleToUpdate['tags'] = [];
        foreach ($this->Database->GenerateRows->tags as $tag) {

            if ($tag['art_id'] === $articleToUpdate['id']) {
                array_push($articleToUpdate['tags'], $tag['tag']);
            }
        }

        $newData = [
                    'id' => $articleToUpdate['id'],
                    'tags' => $articleToUpdate['tags'],
                    'displayOrder' => $articleToUpdate['display_order'],
                    'article' => $articleToUpdate['lede'] . $articleToUpdate['body']
                    ];

        $newData[$fieldToChange] = $newValue;

        return $this->request([
            'query' => 'mutation ArticleUpdate($data: [UpdateArticle], $password: String) {
                            updateArticles(data: $data, password: $password) {
                                id
                                tags
                                displayOrder
                            }
                        }',
            'variables' => [
                'data' => [$newData],
                'password' => $user['password']
            ]
        ], $loggedIn ? HelpTests::getJwt($user) : null);
    }

    function testNotLoggedInCannotEditAnyText() {

        $newArticle = $this->Database->GenerateRows->pageinfo();

        $data = $this->helpTestUpdate(function () {
            return true;
        }, 'article', $newArticle['lede'] . $newArticle['body'], false);

        $this->assertNull($data['updateArticles']);
    }

    function testNotLoggedInCannotEditDisplayOrder() {

        $newArticle = $this->Database->GenerateRows->pageinfo();

        $data = $this->helpTestUpdate(function () {
            return true;
        }, 'displayOrder', $newArticle['display_order'], false);

        $this->assertNull($data['updateArticles']);
    }

    function testNotLoggedInCannotEditTags() {

        $newTags = HelpTests::faker()->randomElements($this->Database->GenerateRows->tag_list);

        $data = $this->helpTestUpdate(function () {
            return true;
        }, 'tags', $newTags, false);

        $this->assertNull($data['updateArticles']);
    }

    function testCanEditOwnArticleText() {

        $newArticle = $this->Database->GenerateRows->pageinfo();

        $data = $this->helpTestUpdate(function () {
            return true;
        }, 'article', $newArticle['lede'] . $newArticle['body'], true, true);

        $this->assertNotNull($data['updateArticles']);
    }

    function testCanEditAnyArticleTextIfLevelGreaterThanTwo() {

        $newArticle = $this->Database->GenerateRows->pageinfo();

        $data = $this->helpTestUpdate(function () {
            return true;
        }, 'article', $newArticle['lede'] . $newArticle['body'], true, false, 3);

        $this->assertNotNull($data['updateArticles']);
    }

    function testCannotEditIfWrongPassword() {

        $newArticle = $this->Database->GenerateRows->pageinfo();

        $data = $this->helpTestUpdate(function () {
            return true;
        }, 'article', $newArticle['lede'] . $newArticle['body'], true, false, 3, false);

        $this->assertNotNull($data['updateArticles']);
    }

    function testLevelThreeCanModifyDisplayOrder() {

        $newArticle = $this->Database->GenerateRows->pageinfo();

        $data = $this->helpTestUpdate(function () {
            return true;
        }, 'displayOrder', $newArticle['display_order'], true, false, 3);

        $this->assertNotNull($data['updateArticles']);
    }

    function testLevelThreeCanModifyTags() {

        $newTags = HelpTests::faker()->randomElements($this->Database->GenerateRows->tag_list());

        $data = $this->helpTestUpdate(function () {
            return true;
        }, 'tags', array_column($newTags, 'tag'), true, false, 3);

        $this->assertNotNull($data['updateArticles']);
    }
}
?>