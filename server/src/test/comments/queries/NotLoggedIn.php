<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class NotLoggedInCommentTest extends CommentTest {

    /**
     * Sends graphql query
     *
     * @param $variableTypes - graphql variables with type. Example: ['$num: => 'ID', '$limit': 'Int']
     * @param $variableValues - values to give variables listed as keys to $variableTypes
     */
    protected function helpTestArgs(array $variableTypes, array $variableValues) {

        $variableStrings = HelpTests::convertVariableArrayToGraphql($variableTypes);

        return $this->request([
            'query' => "query CommentQuery({$variableStrings['types']}) {
                            comments({$variableStrings['mappings']}) {
                                id
                                content,
                                dateCreated,
                                canDelete
                                artId
                            }
                        }",
            'variables' => $variableValues
        ]);
    }

    /**
     * Gets a comment
     *
     * @param $public - if comment should come from a public article or not
     *
     * @return a private comment (from Database->GenerateRows)
     */
    protected function helpGetComment(bool $public = false) {

        return HelpTests::searchArray($this->Database->GenerateRows->comments, function (array $currentComment, bool $public) {

            $articleOfComment = HelpTests::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle, array $currentComment) {
                return $currentComment['art_id'] == $currentArticle['id'];
            }, $currentComment);

            $privateIssue = $this->Database->GenerateRows->issues[0]['num'];

            return ($public) ? $articleOfComment['issue'] != $privateIssue : $articleOfComment['issue'] == $privateIssue;
        }, $public);
    }

    function testCannotGetCommentsOfPrivateArticlesById() {

        $privateCommentId = $this->helpGetComment()['id'];

        $data = $this->helpTestArgs(['$id' => 'ID'], ['id' => $privateCommentId]);

        $this->assertEmpty($data['comments'], $data);
    }

    function testCannotGetCommentsOfPrivateArticlesByAuthor() {

        $privateComment = $this->helpGetComment();

        $data = $this->helpTestArgs(['$authorid' => 'ID'], ['authorid' => $privateComment['authorid']]);

        foreach ($data['comments'] as $comment) {

            $this->assertNotEquals($comment['artId'], $privateComment['art_id']);
        }
    }

    function testCannotGetCommentsOfPrivateArticlesByArticle() {

        $privateCommentArticleId = $this->helpGetComment()['art_id'];

        $data = $this->helpTestArgs(['$artId' => 'ID'], ['artId' => $privateCommentArticleId]);

        $this->assertEmpty($data['comments']);
    }

    function testCanDeleteIsFalse() {

        $publicComment = $this->helpGetComment(true);

        $data = $this->helpTestArgs(['$id' => 'ID'], ['id' => $publicComment['id']]);

        $this->assertFalse($data['comments'][0]['canDelete']);
    }
}
?>