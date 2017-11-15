<?php


require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');


class UserNotLoggedInTest extends UserTest {

    /**
     * Checks if can get $attribute when not logged in
     *
     * @param $attribute - graphql field
     */
    private function helperTest(string $attribute) {

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $user) {
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

        $this->assertFalse(!!$data['users'][0][$attribute]);
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

    /**
     * Checks if article is public
     *
     * @param $article - article to check
     *
     * @return boolean if article is public or not
     */
    protected function helpCheckArticleIsPublic(array $article) {

        return $articleIsPublic = $article['issue'] < $this->Database->GenerateRows->issues[0]['num'] ||
          $this->Database->GenerateRows->issues[0]['ispublic'] == true;
    }

    function testGetOnlyPublicArticleCount() {

        $user = HelpTests::faker()->randomElement($this->Database->GenerateRows->users);

        $actualPublicArticleCount = 0;

        foreach ($this->Database->GenerateRows->pageinfo as $article) {

            if ($article['authorid'] == $user['id'] && $this->helpCheckArticleIsPublic($article)) {
                $actualPublicArticleCount++;
            }
        }

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

        $this->assertEquals($actualPublicArticleCount, $data['users'][0]['articleCount']);
    }

    function helpGetPublicArticles() {

        return array_reduce($this->Database->GenerateRows->pageinfo, function (array $publicArticles, array $currentArticle) {

            if ($this->helpCheckArticleIsPublic($currentArticle)) {
                array_push($publicArticles, $currentArticle);
            }

            return $publicArticles;
        }, []);
    }

    function testCanOnlyViewPublicArticles() {

        $user = HelpTests::faker()->randomElement($this->Database->GenerateRows->users);

        $expectedIds = [];

        foreach ($this->helpGetPublicArticles() as $article) {

            if ($article['authorid'] == $user['id']) {
                array_push($expectedIds, $article['id']);
            }
        }

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

        HelpTests::compareArrayContents($expectedIds, array_column($articles['users'][0]['articles'], 'id'));
    }

    function testCannotEditUsers() {

        $data = $this->request([
            'query' => 'query users {
                            users {
                                canEdit
                            }
                        }'
        ]);

        $canEdits = array_column($data['users'], 'canEdit');

        $this->assertFalse(in_array(true, $canEdits));
    }

}