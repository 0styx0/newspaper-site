<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class CreateArticleTest extends ArticleTest {

    protected function helpCreate(bool $loggedIn = true, int $tags = 3, string $url) {

        $faker = HelpTests::faker();
        $newArticle = $this->Database->GenerateRow->pageinfo($faker);
        $author = $faker->randomElement($this->Database->GenerateRows->users);

        return $this->request([
            'query' => 'mutation ArticleCreate($tags: [String], $url: String!, $article: String!) {
                            createArticle(tags: $tags, url: $url, article: $article) {
                                issue
                                url
                            }
                        }',
            'variables' => [
                'url' => isset($url) ? $url : $newArticle['url'],
                'article' => $newArticle['lede'] . $newArticle['body'],
                'tags' => $faker->randomElements($this->Database->GenerateRows->tag_list, $tags)
            ]
        ], $loggedIn ? HelpTests::getJwt($author) : null);
    }

    function testNotLoggedInCannotCreate() {

        $data = $this->helpCreate(false);
        $this->assertNull($data);
    }

    function testArticleMustHaveAtLeastOneTag() {

        $data = $this->helpCreate(true, 0);
        $this->assertNull($data);
    }

    function testArticleMustHaveUrl() {

        $data = $this->helpCreate(true, 3, null);
        $this->assertNull($data);
    }

    function testArticleIsInMostRecentPrivateIssue() {

        $data = $this->helpCreate();
        $this->assertNotNull($data);

        $issue = Db::query("SELECT issue FROM pageinfo WHERE id = ?", [$data['articles'][0]['num']])->fetchColumn();

        $this->assertEqual($this->Database->GenerateRows->issues[0]['num'], $issue);
    }

    // if all issues are public, then a new issue is created with new article in it
    function testIfNoPrivateIssuePrivateIssueIsCreated() {

        $faker = HelpTests::$faker();

        Db::query("UPDATE issues SET public = ?", [1]);

        $data = $this->helpCreate();
        $this->assertNotNull($data);

        $issue = Db::query("SELECT issue FROM pageinfo WHERE id = ?", [$data['articles'][0]['num']])->fetchColumn();

        $this->assertEqual($this->Database->GenerateRows->issues[0]['num'] + 1, $issue);

        array_unshift($this->Database->GenerateRows->issues, [
            'num' => $issue
        ]);
    }
}
?>