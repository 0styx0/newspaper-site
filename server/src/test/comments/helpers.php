<?php

use PHPUnit\Framework\TestCase;

require_once(__DIR__ . '/../../../vendor/autoload.php');

abstract class CommentTestHelper extends TestHelper {

    protected $Database;

    protected function setup() {

        $this->Database = new TestDatabase();
        $this->Database->init();
    }

    /**
     * Gets a comment
     *
     * @param $public - if comment should come from a public article or not
     *
     * @return a private comment (from Database->GenerateRows)
     */
    protected function helpGetComment(bool $public = false) {

        return TestHelper::searchArray($this->Database->GenerateRows->comments, function (array $currentComment, bool $public) {

            $articleOfComment = TestHelper::searchArray($this->Database->GenerateRows->pageinfo, function (array $currentArticle, array $currentComment) {
                return $currentComment['art_id'] == $currentArticle['id'];
            }, $currentComment);

            $privateIssue = $this->Database->GenerateRows->issues[0]['num'];

            return ($public) ? $articleOfComment['issue'] != $privateIssue : $articleOfComment['issue'] == $privateIssue;
        }, $public);
    }

    /**
      * @param $args - @see TestHelper::createHTTPRequest param $args
      */
    protected function request(array $args = [], $jwt = '') {

        $result = TestHelper::createHTTPRequest($args , 'comments', $jwt);

        return $result['data'];
    }
}
?>