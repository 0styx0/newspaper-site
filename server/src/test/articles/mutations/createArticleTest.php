<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class CreateArticleTest extends ArticleTestHelper {

    protected function helpCreate(bool $loggedIn = true, int $tags = 3, $url = true, $extraBody = '') {

        $faker = TestHelper::faker();
        $newArticle = $this->Database->GenerateRows->pageinfo();
        $newArticle['body'] .= $extraBody;
        $author = $faker->randomElement($this->Database->GenerateRows->users);
        $tagList = $this->Database->GenerateRows->tag_list;

        $tagsToGet = ($tags > count($tagList)) ? count($tagList) : $tags;

        return $this->request([
            'query' => 'mutation ArticleCreate($tags: [String], $url: String!, $article: String!) {
                            createArticle(tags: $tags, url: $url, article: $article) {
                                issue
                                url
                            }
                        }',
            'variables' => [
                'url' => $url ? $newArticle['url'] : '',
                'article' => $newArticle['lede'] . $newArticle['body'],
                'tags' => array_column($faker->randomElements($this->Database->GenerateRows->tag_list, $tagsToGet), 'tag')
            ]
        ], $loggedIn ? TestHelper::getJwt($author) : null)['createArticle'];
    }

    function testNotLoggedInCannotCreate() {

        $data = $this->helpCreate(false);
        $this->assertNull($data);
    }

    function testArticleMustHaveAtLeastOneTag() {

        $data = $this->helpCreate(true, 0);
        $this->assertNull($data);
    }

    function testCanHaveTagsAndImageInSameArticle() {

        $data = $this->helpCreate(true, 3, true, '<img src="https://random.jpg" />');
        $this->assertNotNull($data);
    }

    function testArticleMustHaveUrl() {

        $data = $this->helpCreate(true, 3, false);
        $this->assertNull($data);
    }

    function testArticleIsInMostRecentPrivateIssue() {

        $data = $this->helpCreate();
        $this->assertNotNull($data);

        $issue = Db::query("SELECT issue FROM pageinfo WHERE issue = ? AND url = ?",
          [$data['issue'], $data['url']])->fetchColumn();

        $this->assertEquals($this->Database->GenerateRows->issues[0]['num'], $issue);
    }

    // if all issues are public, then a new issue is created with new article in it
    function testIfNoPrivateIssuePrivateIssueIsCreated() {

        $faker = TestHelper::faker();

        Db::query("UPDATE issues SET ispublic = ?", [1]);

        $data = $this->helpCreate();
        $this->assertNotNull($data);

        $issue = Db::query("SELECT issue FROM pageinfo WHERE issue = ? AND url = ?",
          [$data['issue'], $data['url']])->fetchColumn();

        $this->assertEquals($this->Database->GenerateRows->issues[0]['num'] + 1, $issue);

        array_unshift($this->Database->GenerateRows->issues, [
            'num' => $issue
        ]);
    }
}
?>
