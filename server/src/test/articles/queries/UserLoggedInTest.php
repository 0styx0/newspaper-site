<?php


require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class UserLoggedInTest extends ArticleTest {

    function testCanSeeAnyArticle() {

        $user = $this->Database->getRandomUser();
        $expectedIds = array_column($this->Database->GenerateRows->pageinfo, 'id');

        foreach ($expectedIds as $i => $id) {
            $expectedIds[$i] = (string) $id;
        }

        $ids = Db::query("SELECT id FROM pageinfo")->fetchAll(PDO::FETCH_COLUMN, 0);

        $data = $this->request([
            'query' => 'query articles {
                            articles {
                                id
                            }
                        }'
        ], HelpTests::getJwt($user));

        $this->compareArrayContents($expectedIds, array_column($data['articles'], 'id'));
    }

    function testCanEditOwnArticles() {

        // get user with at least 1 article
        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {

            if ($currentUser['level'] > 2) {
                return false;
            }

            $article = HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function (array $article, array $currentUser) {

                $articleIsPrivate = $article['issue'] == $this->Database->GenerateRows->issues[0]['num'];

                return $article['authorid'] == $currentUser['id'];
            }, $currentUser);

            return $article && $currentUser['level'] == 1; // just to show that canEdit own article *even* if only lvl 1
        });

        $data = $this->request([

            'query' => 'query ArticleQuery($authorid: ID) {
                        articles(authorid: $authorid) {
                            canEdit
                            issue
                        }
                    }',
            'variables' => [
                'authorid' => $user['id']
            ]
        ], HelpTests::getJwt($user));

        foreach ($data['articles'] as $article) {

            if ($article['issue'] == $this->Database->GenerateRows->issues[0]['num']) {
                $this->assertTrue($article['canEdit']);
            } else {
                $this->assertFalse($article['canEdit']);
            }
        }
    }

    function testCanEditLowerLevelArticles() {

        $user = $this->Database->getUserOfLevel(rand(2, 3));

        $authorOfArticleToCheck = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser, array $user) {

            if ($currentUser['level'] >= $user['level']) {
                return false;
            }

            $userIsAnAuthor = !!HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle, string $userId) {

                $articleIsPrivate = $currentArticle['issue'] == $this->Database->GenerateRows->issues[0]['num'];

                return $userId == $currentArticle['authorid'] && $articleIsPrivate;
            }, $currentUser['id']);

            return $userIsAnAuthor;

        }, $user);

        $data = $this->request([

            'query' => 'query ArticleQuery($authorid: ID) {
                        articles(authorid: $authorid) {
                            canEdit
                            issue
                        }
                    }',
            'variables' => [
                'authorid' => $authorOfArticleToCheck['id']
            ]
        ], HelpTests::getJwt($user));

        foreach ($data['articles'] as $article) {

            $articleIsPublic = $article['issue'] < $this->Database->GenerateRows->issues[0]['num'];
            $canEditPublicArticles = $user['level'] == 3;

            if (($articleIsPublic && $canEditPublicArticles) || !$articleIsPublic) {
                $this->assertTrue($article['canEdit']);
            } else {
                $this->assertFalse($article['canEdit']);
            }
        }
    }

    function testCannotEditHigherOrEqualLevelArticles() {

        // get user with at least 1 article
        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {

            return $currentUser['level'] == rand(1, 2);
        });

        $authorOfArticleToCheck = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser, array $user) {

            if ($currentUser['level'] < $user['level'] || $currentUser['id'] == $user['id']) {
                return false;
            }

            $userIsAnAuthor = !!HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle, string $userId) {
                return $userId == $currentArticle['authorid'];
            }, $currentUser['id']);

            return $userIsAnAuthor;
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
        ], HelpTests::getJwt($user));

        $this->assertFalse($data['articles'][0]['canEdit']);
    }

    function testCannotEditOwnPublicArticles() {

        $articleToTest = HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle) {

            $issues = $this->Database->GenerateRows->issues;
            $publicIssueIndex = rand(1, count($issues) - 1);

            $articleIsPrivate = $currentArticle['issue'] == $issues[$publicIssueIndex]['num'];

            if ($articleIsPrivate) {
                return false;
            }

            $authorLessThanLevelThree = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser, string $wantedId) {
                // lvl 3 can edit public articles so don't want to test that here
                return $currentUser['id'] == $wantedId && $currentUser['level'] < 3;
            }, $currentArticle['authorid']);


            return $authorLessThanLevelThree;
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

        $levelThreeUser = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {
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
        $this->assertEquals($articleToTest['views'], $views);
    }
}

?>