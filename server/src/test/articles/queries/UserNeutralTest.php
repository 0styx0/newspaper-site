<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class UserNeutralTest extends ArticleTest {

    /**
     * @return a public article
     */
    protected function helpGetPublicArticle() {

        return HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle) {
            $currentArticle['issue'] < $this->Database->GenerateRows->issues[0]['num'];
        });
    }

    function testCanQueryByIssue() {

        $data = $this->request([
            'query' => 'query articles($issue: Int) {
                            articles(issue: $issue) {
                                id
                            }
                        }',
            'variables' => [
                'id' => $this->Database->GenerateRows->issues[1]['num'] // so public article so don't need to login
            ]
        ]);

        $this->assertNotNull($data['articles']);
    }

    function testCanQueryByTag() {

        $tagToGet = HelpTests::faker()->randomElement($this->Database->GenerateRows->tag_list)['tag'];

        $data = $this->request([
            'query' => 'query articles($tag: String) {
                            articles(tag: $tag) {
                                id
                            }
                        }',
            'variables' => [
                'tag' => $tagToGet
            ]
        ]);

        $this->assertNotNull($data['articles']);
    }

    function testCanQueryByAuthor() {

        $data = $this->request([
            'query' => 'query articles($authorid: ID) {
                            articles(authorid: $authorid) {
                                id
                            }
                        }',
            'variables' => [
                'authorid' => $this->helpGetPublicArticle()['authorid']
            ]
        ]);

        $this->assertNotNull($data['articles']);
    }

    function testCanQueryByIssueAndUrl() {

        $articleToGet = $this->helpGetPublicArticle();

        $data = $this->request([
            'query' => 'query articles($issue: ID, $url: String) {
                            articles(issue: $issue, url: $url) {
                                id
                            }
                        }',
            'variables' => [
                'issue' => $articleToGet['issue'],
                'url' => $articleToGet['url']
            ]
        ]);

        $this->assertNotNull($data['articles']);
    }

    function testViewsIncrementWhenArticleIsViewed() {


        $articleToGet = $this->helpGetPublicArticle();

        $viewsBefore = Db::query("SELECT views FROM pageinfo WHERE id = ?", [$articleToGet['id']])->fetchColumn();

        $data = $this->request([
            'query' => 'query articles($id: ID) {
                            articles(id: $id) {
                                id
                                article
                            }
                        }',
            'variables' => [
                'id' => $articleToGet['id']
            ]
        ]);

        $this->assertNotNull($data['articles']);

        $afterViews = $Db::query("SELECT views from pageinfo WHERE id = ?", [$articleToGet['id']])->fetchColumn();

        $this->assertEqual($viewsBefore + 1, $afterViews);
    }
}
?>