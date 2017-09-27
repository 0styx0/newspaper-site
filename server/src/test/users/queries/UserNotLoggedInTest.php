<?php


require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');


class UserTest extends UserTest {

    /**
     * Checks if can get $attribute when not logged in
     *
     * @param $attribute - graphql field
     */
    private function helperTest(string $attribute) {

        $user = HelpTests::searchArray($this->TestDatabase->GenerateRows->users, function (array $user) {
            return $user['level'] == 3;
        });

        $data = $this->request([
            'query' => "query users(\$id: ID) {
                            users(id: \$id) {
                                {$attribute}
                            }
                        }",
            'variables' => [
                'id' => $user['id']
            ]
        ]);

        $this->assertNull($data['users'][0][$attribute]);
    }

    function testCannotGetPassword() {

        $this->helperTest('password');
    }

    function testCannotGetUsername() {

        $this->helperTest('username');
    }

    function testCannotGetNotificationSetting() {

        $this->helperTest('notifications');
    }

    function testCannotGetTwoFactor() {

        $this->helperTest('twoFactor');
    }

    protected function helpGetRandomUser() {

        return $this->TestDatabase->users[ rand(0, count($this->TestDatabase->users)) - 1 ];
    }

    /**
     * Checks if article is public
     *
     * @param $article - article to check
     *
     * @return boolean if article is public or not
     */
    protected function helpCheckArticleIsPublic(array $article): boolean {

        return $articleIsPublic = $article['issue'] < $this->TestDatabase->issues[0]['num'] || $this->TestDatabase->issues[0]['public'] == true;
    }

    function testGetOnlyPublicArticleCount() {

        $user = $this->helpGetRandomUser();

        $actualPublicArticleCount = array_reduce($this->TestDatabase->pageinfo, function (int $count, array $article) {

            if ($article['authorid'] == $user['id'] && $this->helpCheckArticleIsPublic($article)) {
                $accum++;
            }

            return $accum;
        }, 0);

        $data = $this->request([
            'query' => 'query users($id: ID) {
                            users(id: $id) {
                                articleCount
                            }
                        }',
            'variables' => [
                'id' => $user['id']
            ]
        ]);

        $this->assertEqual($actualPublicArticleCount, $data['users'][0]['articleCount']);
    }

    function helpGetPublicArticles() {


        array_reduce($this->Database->pageinfo, function (array $publicArticles, array $currentArticle) {

            if ($this->helpCheckArticleIsPublic($article)) {
                array_push($publicArticles, $article);
            }

            return $publicArticles;
        }, []);
    }

    function testCanOnlyViewPublicArticles() {

        $user = $this->helpGetRandomUser();

        $expectedIds = array_reduce($this->helpGetPublicArticles(), function (array $articleIds, array $article) {

            if ($article['authorid'] == $user['id']) {
                $articleIds[] = $article['id'];
            }

            return $articleIds;
        }, []);

        $articles = $this->request([
           'query' => 'query users($id: ID) {
                           users(id: $id) {
                               articles {
                                   id
                               }
                           }
                       }',
            'variables' => [
                'id' => $user['id']
            ]
        ]);

        $this->assertEqual($expectedIds, array_column($articles['users']['articles'], 'id'));
    }

    function testCannotEditUsers() {

        $data = $this->request([
            'query' => 'query users($id: ID) {
                            users {
                                canEdit
                            }
                        }'
        ]);

        $canEdits = array_column($data['users'], 'canEdit');

        $this->assertFalse(in_array(true, $canEdits));
    }

}