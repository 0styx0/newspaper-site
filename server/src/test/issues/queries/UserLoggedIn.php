<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class LoggedInIssueTest extends IssueTest {

    function testGetMostRecentIssueIfInvalidNumPassed() {

        $maxIssue = $this->Database->GenerateRows->issues[0]['num'];

        $data = $this->request([
            'query' => 'query IssueInfo($num: ID) {
                            issues(num: $num, limit: 1) {
                                num
                                max
                                name
                            }
                        }',
            'variables' => [
                'num' => $maxIssue + 1
            ]
        ], HelpTests::getJwt($this->Database->GenerateRows->users[0]));
        
        $this->assertEquals($maxIssue, $data['issues'][0]['num']);
    }
}