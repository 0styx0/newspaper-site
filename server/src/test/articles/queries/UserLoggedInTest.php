<?php


require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class UserLoggedInArticleTest extends ArticleTestHelper {

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
        ], TestHelper::getJwt($user));

        $this->compareArrayContents($expectedIds, array_column($data['articles'], 'id'));
    }

    function testCanEditOwnArticles() {

        // get user with at least 1 article
        $user = TestHelper::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {

            if ($currentUser['level'] > 2) {
                return false;
            }

            $article = TestHelper::searchArray($this->Database->GenerateRows->pageinfo, function (array $article, array $currentUser) {

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
        ], TestHelper::getJwt($user));

        foreach ($data['articles'] as $article) {

            if ($article['issue'] == $this->Database->GenerateRows->issues[0]['num']) {
                $this->assertTrue($article['canEdit']);
            } else {
                $this->assertFalse($article['canEdit']);
            }
        }
    }

    function testCannotEditHigherOrEqualLevelArticles() { // and not admin

        $levelOfUser = 2;

        // get user with at least 1 article
        $user = TestHelper::searchArray($this->Database->GenerateRows->users, function (array $currentUser, int $levelOfUser) {

            return $currentUser['level'] == $levelOfUser;
        }, $levelOfUser);

        $authorOfArticleToCheck = TestHelper::searchArray($this->Database->GenerateRows->users, function (array $currentUser, array $user) {

            if ($currentUser['level'] < $user['level'] || $currentUser['id'] == $user['id']) {
                return false;
            }

            $userIsAnAuthor = !!TestHelper::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle, string $userId) {
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
        ], TestHelper::getJwt($user));

        $this->assertFalse($data['articles'][0]['canEdit']);
    }

    function testCannotEditOwnPublicArticles() {

        $articleToTest = TestHelper::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle) {

            $issues = $this->Database->GenerateRows->issues;

            $articleIsPrivate = $currentArticle['issue'] === $issues[0]['num'];

            if ($articleIsPrivate) {
                return false;
            }

            $authorLessThanLevelThree = TestHelper::searchArray($this->Database->GenerateRows->users, function (array $currentUser, string $wantedId) {
                // lvl 3 can edit public articles so don't want to test that here
                return $currentUser['id'] == $wantedId && $currentUser['level'] < 3;
            }, $currentArticle['authorid']);


            return $authorLessThanLevelThree;
        });

        $author = TestHelper::searchArray($this->Database->GenerateRows->users, function (array $currentUser, array $articleToTest) {
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
        ], TestHelper::getJwt($author));

        $this->assertFalse($data['articles'][0]['canEdit']);
    }

    function testCanEditPublicArticlesIfLevelThree() {

        $articleToTest = TestHelper::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle) {
            return $currentArticle['issue'] == $this->Database->GenerateRows->issues[0]['num'];
        });

        $levelThreeUser = TestHelper::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {

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
        ], TestHelper::getJwt($levelThreeUser));

        $this->assertTrue($data['articles'][0]['canEdit']);
    }

    function testViewsStaySameIfReqestPrivateArticle() {

        $articleToTest = TestHelper::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle) {
            return $currentArticle['issue'] == $this->Database->GenerateRows->issues[0]['num'];
        });

        $levelThreeUser = TestHelper::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {
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
        ], TestHelper::getJwt($levelThreeUser));

        $this->assertNotNull($data['articles'][0]);

        $views = Db::query("SELECT views FROM pageinfo WHERE id = ?", [$articleToTest['id']])->fetchColumn();
        $this->assertEquals($articleToTest['views'], $views);
    }
}

?>