<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class UserNotLoggedInTest extends ArticleTest {

    function testCannotQueryArticlesThatArePrivate() {

        $article = HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle) {
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

        $this->assertNull($data['articles'][0]);
    }

    function testCannotEditAnyArticles() {

        $article = HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle) {
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