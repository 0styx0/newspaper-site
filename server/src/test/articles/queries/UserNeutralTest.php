<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class UserNeutralTest extends ArticleTest {

    /**
     * @return a public article
     */
    protected function helpGetPublicArticle() {

        return HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle, $privateIssue) {
            return $currentArticle['issue'] < $privateIssue;
        }, $this->Database->GenerateRows->issues[0]['num']);
    }

    function testCanQueryByIssue() {

        $issueToGet = $this->Database->GenerateRows->issues[1]['num'];
        $expected = [];

        foreach ($this->Database->GenerateRows->pageinfo as $article) {

            if ($article['issue'] == $issueToGet) {
                $expected[] = $article['id'] . '';
            }
        }

        $data = $this->request([
            'query' => 'query articles($issue: Int) {
                            articles(issue: $issue) {
                                id
                            }
                        }',
            'variables' => [
                'issue' => $issueToGet // so public article so don't need to login
            ]
        ]);

        HelpTests::compareArrayContents($expected, array_column($data['articles'], 'id'));
    }

    function testCanQueryByTag() {

        $tagToGet = HelpTests::faker()->randomElement($this->Database->GenerateRows->tags)['tag'];
        $expected = [];

        foreach ($this->Database->GenerateRows->tags as $tag) {

            if ($tag['tag'] == $tagToGet) {

                $articleIsPublic = HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function ($currentArticle, $idToFind) {
                    return $currentArticle['id'] == $idToFind && $currentArticle['issue'] < $this->Database->GenerateRows->issues[0]['num'];
                }, $tag['art_id']);

                if ($articleIsPublic) {
                    $expected[] = $tag['art_id'];
                }
            }
        }

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

        HelpTests::compareArrayContents($expected, array_column($data['articles'], 'id'));
    }

    function testCanQueryByAuthor() {

        $authorid = $this->helpGetPublicArticle()['authorid'];

        $expected = [];

        foreach ($this->Database->GenerateRows->pageinfo as $article) {

            if ($article['authorid'] == $authorid &&
                $article['issue'] < $this->Database->GenerateRows->issues[0]['num']) {

                $expected[] = $article['id'];
            }
        }

        $data = $this->request([
            'query' => 'query articles($authorid: ID) {
                            articles(authorid: $authorid) {
                                id
                            }
                        }',
            'variables' => [
                'authorid' => $authorid
            ]
        ]);

        HelpTests::compareArrayContents($expected, array_column($data['articles'], 'id'));
    }

    function testCanQueryByIssueAndUrl() {

        $articleToGet = $this->helpGetPublicArticle();

        $data = $this->request([
            'query' => 'query articles($issue: Int, $url: String) {
                            articles(issue: $issue, url: $url) {
                                id
                            }
                        }',
            'variables' => [
                'issue' => $articleToGet['issue'],
                'url' => $articleToGet['url']
            ]
        ]);

        $this->assertEquals($articleToGet['id'], $data['articles'][0]['id']);
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

        $this->assertEquals($articleToGet['id'], $data['articles'][0]['id']);

        $afterViews = Db::query("SELECT views from pageinfo WHERE id = ?", [$articleToGet['id']])->fetchColumn();

        $this->assertEquals($viewsBefore + 1, $afterViews);
    }
}
?>