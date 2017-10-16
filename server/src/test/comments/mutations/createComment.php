<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class CreateCommentTest extends CommentTest {

    /**
     * Runs all duplicate functionality
     *
     * @param $article - @see $this->Database->GenerateMockRows->pageinfo
     * @param $content - body of comment
     * @param $loggedIn - bool
     *
     */
    protected function helpTest(array $article, string $content, bool $loggedIn = true) {

        $user = HelpTests::faker()->randomElement($this->Database->GenerateMockRows->users);

        $data = $this->request([
            'query' => 'mutation CommentCreate($artId: ID!, $content: String!) {
                            createComment(artId: $artId, content: $content) {
                              id
                            }
                          }',
            'variables' => [
                'artId' => $article['id'],
                'content' => $content
            ]
        ], $loggedIn ? HelpTests::getJwt($user) : '');

        return ['user' => $user, '$data' => $data];
    }

    /**
     * Gets an article
     *
     * @param $public - if public article or not
     *
     * @return article (from Database->GenerateMockRows->pageinfo)
     */
    protected function helpGetArticle(bool $public = false) {

        return HelpTests::searchArray($this->Database->GenerateMockRows->pageinfo, function (array $currentArticle) {

            $privateIssue = $this->Database->GenerateMockRows['issue'][0]['num'];
            $articleIsPrivate = $privateIssue !== $currentArticle['issue'];

            return $public ? !$articleIsPrivate : $articleIsPrivate;
        });
    }

    function testBadNotLoggedIn() {

        $data = $this->helpTest($this->helpGetArticle(), HelpTests::faker()->randomHtml(), false);

        $this->assertNull($data['data']);
    }

    function testContentCannotBeBlank() {

        foreach (['', null, false, true, 0] as $badContent) {

            $data = $this->helpTest($this->helpGetArticle(), $badContent);

            $this->assertNull($data['data'], $badContent);
        }
    }

    function testCanCommentOnPublicArticles() {

        $expectedContent = HelpTests::faker()->randomHtml();
        $expectedArticle = $this->helpGetArticle();
        $data = $this->helpTest($expectedArticle, $expectedContent);

        $dbComment = Db::query("SELECT authorid, content, art_id FROM comments WHERE id = ?", [$data['comments'][0]['id']])->fetchColumn();

        $this->assertEqual($dbComment, [
            'art_id' => $expectedArticle['id'],
            'authorid' => $data['user']['id'],
            'content' => $expectedContent
        ]);
    }

    function testGoodCannotCommentOnPrivateArticles() {

        $data = $this->helpTest($this->helpGetArticle(), HelpTests::faker()->randomHtml());

        $dbComment = Db::query("SELECT authorid, content, art_id FROM comments WHERE id = ?", [$data['comments'][0]['id']])->fetchColumn();

        $this->assertNull($dbComment);
        $this->assertNull($data);
    }

    function testContentCannotBeMalicious() { // bad content should be converted to nothing or escaped

        $articleToCommentOn = $this->helpGetArticle();

        foreach (HelpTests::unsafeData as $content) {

            $data = $this->helpTest($articleToCommentOn, $content);

            $dbComment = Db::query("SELECT authorid, content, art_id FROM comments WHERE id = ?", [$data['comments'][0]['id']])->fetchColumn();

            $this->assertNull($dbComment); // still not sure what will do with bad content
        }
    }
}
?>