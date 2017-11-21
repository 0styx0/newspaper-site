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

            $good = true;

            $userIsAuthor = $currentUser['id'] == $scopedVars['articleToUpdate']['authorid'];

            $good = $good && (!$scopedVars['author'] || $userIsAuthor);

            $good = $good && ($currentUser['level'] == $scopedVars['level']);

            return $good;
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
                    'displayOrder' => $articleToUpdate['display_order']
                    ];

        $newData[$fieldToChange] = $newValue;

        $data = $this->request([
            'query' => 'mutation ArticleUpdate($data: [UpdateArticle], $password: String) {
                            updateArticles(data: $data, password: $password) {
                                id
                                tags
                                displayOrder
                            }
                        }',
            'variables' => [
                'data' => [$newData],
                'password' => $correctPassword ? $user['password'] : ''
            ]
        ], $loggedIn ? HelpTests::getJwt($user) : null);

        return ['data' => $data, 'articleToUpdate' => $articleToUpdate];
    }

    function testNotLoggedInCannotEditDisplayOrder() {

        $newArticle = $this->Database->GenerateRows->pageinfo();

        $data = $this->helpTestUpdate(function () {
            return true;
        }, 'displayOrder', $newArticle['display_order'], false)['data'];

        $this->assertNull($data['updateArticles']);
    }

    function testNotLoggedInCannotEditTags() {

        $newTags = HelpTests::faker()->randomElements($this->Database->GenerateRows->tag_list);

        $data = $this->helpTestUpdate(function () {
            return true;
        }, 'tags', $newTags, false)['data'];

        $this->assertNull($data['updateArticles']);
    }

    function testCannotEditIfWrongPassword() {

        $newArticle = $this->Database->GenerateRows->pageinfo();

        $data = $this->helpTestUpdate(function () {
            return true;
        }, 'displayOrder', $newArticle['display_order'] + 1, true, false, 3, false)['data'];

        $this->assertNull($data['updateArticles']);
    }

    function testNonLevelThreeCannotModifyOwnDisplayOrder() {

        $newOrder = rand(1, 100);

        $data = $this->helpTestUpdate(function (array $currentArticle) {

            return HelpTests::searchArray($this->Database->GenerateRows->users, function ($currentUser, $article) {
                return $currentUser['id'] == $article['authorid'] &&
                 $currentUser['level'] == 2; // this number must be same as level param of helpTestUpdate
            }, $currentArticle);
        }, 'displayOrder', $newOrder, true, true, 2);

        $actualOrder = Db::query("SELECT display_order FROM pageinfo WHERE id = ?", [$data['articleToUpdate']['id']])->fetchColumn();

        $this->assertEquals($data['articleToUpdate']['display_order'], $actualOrder);
    }

    function testLevelThreeCanModifyDisplayOrder() {

        $newOrder = rand(1, 100);

        $data = $this->helpTestUpdate(function () {
            return true;
        }, 'displayOrder', $newOrder, true, false, 3);

        $actualOrder = Db::query("SELECT display_order FROM pageinfo WHERE id = ?", [$data['articleToUpdate']['id']])->fetchColumn();
        $this->assertEquals($newOrder, $actualOrder);
    }

    function testLevelThreeCanModifyTags() {

        $newTags = HelpTests::faker()->randomElements($this->Database->GenerateRows->tag_list());

        $data = $this->helpTestUpdate(function () {
            return true;
        }, 'tags', array_column($newTags, 'tag'), true, false, 3)['data'];

        $this->assertNotNull($data['updateArticles']);
    }
}
?>