<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class LoggedInIssueTest extends IssueTest {

    function testGetMostRecentIssueIfInvalidNumPassed() {

        $data = $this->request([
            'query' => 'query IssueInfo($num: ID) {
                            issues(num: $num, limit: 1) {
                                num
                                max
                                name
                            }
                        }',
            'variables' => [
                'num' => $this->Database->GenerateMockRows->issues[0]['num'] + 1
            ]
        ], HelpTests::getJwt($this->Database->GenerateMockRows->users[0]));

        $this->assertNull($data['issues']);
    }
}