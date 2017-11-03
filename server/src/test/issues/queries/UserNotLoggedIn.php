<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class NotLoggedInIssueTest extends IssueTest {

    function testCanOnlyGetPublicIssues() {

        $data = $this->request([
            'query' => "query IssueInfo {
                            issues {
                                num
                                name
                            }
                        }"
        ]);

        $expectedCount = 0;

        foreach ($this->Database->GenerateRows->issues as $issue) {

            if ($issue['public']) {
                $expectedCount++;
            }
        }

        $this->assertEquals($expectedCount, count($data['issues']));
    }

    function testGetMostRecentPublicIssueIfNoArgPassed() {

        $data = $this->request([
            'query' => 'query IssueInfo($num: ID) {
                            issues(num: $num, limit: 1) {
                                num
                                max
                                name
                            }
                        }',
            'variables' => [
                'num' => $this->Database->GenerateRows->issues[0]['num'] + 1
            ]
        ]);

        $publicIssue = HelpTests::searchArray($this->Database->GenerateRows->issues, function (array $issue) {
            return $issue['public'];
        });

        $this->assertEquals($publicIssue['num'], $data['issues'][0]['num']);
    }
}