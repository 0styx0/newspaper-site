<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class LoggedInIssueTest extends IssueTestHelper {

    protected function helpQuery(int $issueToGet, int $levelOfUser = 1) {

        $user = TestHelper::searchArray($this->Database->GenerateRows->users, function (array $currentUser, int $levelToFind) {
            return $currentUser['level'] == $levelToFind;
        }, $levelOfUser);

        return $this->request([
            'query' => 'query IssueInfo($num: ID) {
                            issues(num: $num, limit: 1) {
                                num
                                max
                                name
                                canEdit
                            }
                        }',
            'variables' => [
                'num' => $issueToGet
            ]
        ], TestHelper::getJwt($user))['issues'][0];
    }

    function testGetMostRecentIssueIfInvalidNumPassed() {

        $maxIssue = $this->Database->GenerateRows->issues[0]['num'];

        $data = $this->helpQuery($maxIssue + 1);

        $this->assertEquals($maxIssue, $data['num']);
    }

    function testCanEditIsFalseIfNotAdmin() {

        $maxIssue = $this->Database->GenerateRows->issues[0]['num'];

        $data = $this->helpQuery($maxIssue);

        $this->assertFalse($data['canEdit']);
    }

    function testCanEditIsTrueIfAdminAndPrivateIssue() {

        $maxIssue = $this->Database->GenerateRows->issues[0]['num'];

        $data = $this->helpQuery($maxIssue, 3);

        $this->assertTrue($data['canEdit']);
    }

    function testCanEditIsFalseIfAdminAndPublicIssue() {

        $publicIssue = $this->Database->GenerateRows->issues[1]['num'];

        $data = $this->helpQuery($publicIssue, 3);

        $this->assertFalse($data['canEdit']);
    }
}