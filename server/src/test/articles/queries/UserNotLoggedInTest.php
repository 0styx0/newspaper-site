<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class UserNotLoggedInArticleTest extends ArticleTestHelper {

    function testCannotQueryArticlesThatArePrivate() {

        $article = TestHelper::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle) {
            return $currentArticle['issue'] == $this->Database->GenerateRows->issues[0]['num'];
        });

        $data = $this->request([
            'query' => 'query articles($id: ID) {
                            articles(id: $id) {
                                id
                            }
                        }',
            'variables' => [
                'id' => $article['id']
            ]
        ]);

        $this->assertEmpty($data['articles']);
    }

    function testCannotEditAnyArticles() {

        $article = TestHelper::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle) {
            return $currentArticle['issue'] != $this->Database->GenerateRows->issues[0]['num']; // so get a public article
        });

        $data = $this->request([
            'query' => 'query articles($id: ID) {
                            articles(id: $id) {
                                canEdit
                            }
                        }',
            'variables' => [
                'id' => $article['id']
            ]
        ]);

        $this->assertFalse($data['articles'][0]['canEdit']);
    }
}

?>