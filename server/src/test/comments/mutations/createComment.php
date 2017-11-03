<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class CreateCommentTest extends CommentTest {

    /**
     * Runs all duplicate functionality
     *
     * @param $article - @see $this->Database->GenerateRows->pageinfo
     * @param $content - body of comment
     * @param $loggedIn - bool
     *
     */
    protected function helpTest(array $article, $content, bool $loggedIn = true) {

        $user = HelpTests::faker()->randomElement($this->Database->GenerateRows->users);

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

        return ['user' => $user, 'data' => $data['createComment']];
    }

    /**
     * Gets an article
     *
     * @param $public - if public article or not
     *
     * @return article (from Database->GenerateRows->pageinfo)
     */
    protected function helpGetArticle(bool $public = false) {

        return HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle, bool $public) {

            $privateIssue = $this->Database->GenerateRows->issues[0]['num'];
            $articleIsPrivate = $privateIssue == $currentArticle['issue'];

            return $public ? !$articleIsPrivate : $articleIsPrivate;
        }, $public);
    }

    function testBadNotLoggedIn() {

        $data = $this->helpTest($this->helpGetArticle(), $this->Database->GenerateRows->comment()['content'], false);

        $this->assertNull($data['data']);
    }

    function testContentCannotBeBlank() {

        foreach (['', null, true, 0] as $badContent) {

            $data = $this->helpTest($this->helpGetArticle(), $badContent);

            $this->assertNull($data['data'], '>'. $badContent . '<');
        }
    }

    function testCanCommentOnPublicArticles() {

        $expectedContent = $this->Database->GenerateRows->comment()['content'];
        $expectedArticle = $this->helpGetArticle(true);
        $data = $this->helpTest($expectedArticle, $expectedContent);

        $dbComment = Db::query("SELECT authorid, content, art_id FROM comments WHERE id = ?", [$data['data']['id']])->fetchAll(PDO::FETCH_ASSOC)[0];

        $this->assertEquals([
            'art_id' => $expectedArticle['id'],
            'authorid' => $data['user']['id'],
            'content' => $expectedContent
        ], $dbComment);
    }

    function testGoodCannotCommentOnPrivateArticles() {

        $data = $this->helpTest($this->helpGetArticle(), $this->Database->GenerateRows->comment()['content']);

        $dbComment = Db::query("SELECT authorid, content, art_id FROM comments WHERE id = ?", [$data['data']['id']])->fetchColumn();
        $this->assertFalse($dbComment);
        $this->assertNull($data['data']);
    }

    function testContentCannotBeMalicious() { // bad content should be converted to nothing or escaped

        $articleToCommentOn = $this->helpGetArticle();

        foreach (HelpTests::$unsafeData as $content) {

            $data = $this->helpTest($articleToCommentOn, $content);

            $dbComment = Db::query("SELECT authorid, content, art_id FROM comments WHERE id = ?", [$data['data']['id']])->fetchColumn();

            $this->assertFalse($dbComment); // still not sure what will do with bad content
        }
    }
}
?>