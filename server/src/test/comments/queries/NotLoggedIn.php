<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class NotLoggedInCommentTest extends IssueTest {

    /**
     * Sends graphql query
     *
     * @param $variableTypes - graphql variables with type. Example: ['$num: => 'ID', '$limit': 'Int']
     * @param $variableValues - values to give variables listed as keys to $variableTypes
     */
    protected function helpTestArgs(array $variableTypes, array $variableValues) {

        $variableStrings = HelpTests::convertVariableArrayToGraphql($variableTypes);

        return $this->request([
            'query' => "query CommentQuery({$variablesString['types']}) {
                            comments({$variableStrings['mappings']}) {
                                id
                                content,
                                dateCreated,
                                canDelete
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
     * @return a private comment (from Database->GenerateMockRows)
     */
    protected function helpGetComment(bool $public = false) {

        return HelpTests::searchArray($this->Database->GenerateMockRows, function (array $currentComment, bool $public) {

            $articleOfComment = HelpTests::searchArray($this->Database->GenerateMockRows, function (array $currentArticle, array $currentComment) {
                return $currentComment['art_id'] == $currentArticle['id'];
            }, $currentComment);

            $privateIssue = $this->Database->GenerateMockRows['issue'][0]['num'];

            return ($public) ? $articleOfComment['issue'] != $privateIssue : $articleOfComment['issue'] == $privateIssue;
        }, $public);
    }

    function testCannotGetCommentsOfPrivateArticlesById() {

        $privateCommentId = $this->helpGetComment()['id'];

        $data = $this->helpTestArgs(['$id' => 'ID'], ['id' => $privateCommentId]);

        $this->assertNull($data['comments']);
    }

    function testCannotGetCommentsOfPrivateArticlesByAuthor() {

        $privateCommentAuthorId = $this->helpGetComment()['authorid'];

        $data = $this->helpTestArgs(['$authorid' => 'ID'], ['authorid' => $privateCommentAuthorId]);

        $this->assertNull($data['comments']);
    }

    function testCannotGetCommentsOfPrivateArticlesByArticle() {

        $privateCommentArticleId = $this->helpGetComment()['art_id'];

        $data = $this->helpTestArgs(['$artId' => 'ID'], ['artId' => $privateCommentArticleId]);

        $this->assertNull($data['comments']);
    }

    function testCanDeleteIsFalse() {

        $publicComment = $this->helpGetComment(true);

        $data = $this->helpTestArgs(['$id' => 'ID'], ['id' => $publicComment['id']]);

        $this->assertFalse($data['comments'][0]['canDelete']);
    }
}
?>