<?php


require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class UserLoggedInTest extends ArticleTest {

    function testCanSeeAnyArticle() {

        $user = $this->TestDatabase->getRandomUser();
        $expectedIds = array_column($this->TestDatabase->pageinfo, 'id');

        $data = $this->request([
            'query' => 'query articles {
                            articles {
                                id
                            }
                        }'
        ], HelpTests::getJwt($user));

        $this->expectEqual($expectedIds, array_column($data['articles'], 'id'));
    }

    function testCanEditOwnArticles() {

        // get user with at least 1 article
        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {

            $article = HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function (array $article, array $currentUser) {
                return $article['authorid'] == $currentUser['id'];
            }, $currentUser);

            return $article && $currentUser['level'] == 1; // just to show that canEdit own article *even* if only lvl 1
        });

        $data = $this->request([

            'query' => 'query ArticleQuery($authorid: ID) {
                        articles(authorid: $authorid) {
                            canEdit
                        }
                    }',
            'variables' => [
                'authorid' => $user['id']
            ]
        ]);

        $this->assertTrue($data['articles'][0]['canEdit']);
    }

    function testCanEditLowerLevelArticles() {

        // get user with at least 1 article
        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {

            return $currentUser['level'] == rand(2, 3);
        });

        $authorOfArticleToCheck = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser, array $user) {
            return $currentUser['level'] < $user['level'];
        }, $user);

        $data = $this->request([

            'query' => 'query ArticleQuery($authorid: ID) {
                        articles(authorid: $authorid) {
                            canEdit
                        }
                    }',
            'variables' => [
                'authorid' => $authorOfArticleToCheck['id']
            ]
        ]);

        $this->assertTrue($data['articles'][0]['canEdit']);
    }

    function testCannotEditHigherOrEqualLevelArticles() {

        // get user with at least 1 article
        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {

            return $currentUser['level'] == rand(1, 2);
        });

        $authorOfArticleToCheck = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser, array $user) {
            return $currentUser['level'] >= $user['level'];
        }, $user);

        $data = $this->request([

            'query' => 'query ArticleQuery($authorid: ID) {
                        articles(authorid: $authorid) {
                            canEdit
                        }
                    }',
            'variables' => [
                'authorid' => $authorOfArticleToCheck['id']
            ]
        ]);

        $this->assertFalse($data['articles'][0]['canEdit']);
    }

    function testCannotEditOwnPublicArticles() {

        $articleToTest = HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle) {
            return $currentArticle['issue'] == $this->Database->GenerateRows->issues[0]['num'];
        });

        $author = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser, array $articleToTest) {
           return $currentUser['id'] == $articleToTest['authorid'];
        }, $articleToTest);

        $data = $this->request([

            'query' => 'query ArticleQuery($id: ID) {
                        articles(id: $id) {
                            canEdit
                        }
                    }',
            'variables' => [
                'id' => $articleToTest['id']
            ]
        ], HelpTests::getJwt($author));

        $this->assertFalse($data['articles'][0]['canEdit']);
    }

    function testCanEditPublicArticlesIfLevelThree() {

        $articleToTest = HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle) {
            return $currentArticle['issue'] == $this->Database->GenerateRows->issues[0]['num'];
        });

        $levelThreeUser = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {

            return $currentUser['level'] > 2;
        });

        $data = $this->request([

            'query' => 'query ArticleQuery($id: ID) {
                        articles(id: $id) {
                            canEdit
                        }
                    }',
            'variables' => [
                'id' => $articleToTest['id']
            ]
        ], HelpTests::getJwt($levelThreeUser));

        $this->assertTrue($data['articles'][0]['canEdit']);
    }

    function testViewsStaySameIfReqestPrivateArticle() {

        $articleToTest = HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle) {
            return $currentArticle['issue'] == $this->Database->GenerateRows->issues[0]['num'];
        });

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {
           return $currentUser['level'] > 2;
        });

        $data = $this->request([

            'query' => 'query ArticleQuery($id: ID) {
                        articles(id: $id) {
                            article
                        }
                    }',
            'variables' => [
                'id' => $articleToTest['id']
            ]
        ], HelpTests::getJwt($levelThreeUser));

        $this->assertNotNull($data['articles'][0]);

        $views = Db::query("SELECT views FROM pageinfo WHERE id = ?", [$articleToTest['id']])->fetchColumn();
        $this->assertEqual(0, $views);
    }
}

?>