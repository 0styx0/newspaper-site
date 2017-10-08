<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class NotLoggedInIssueTest extends IssueTest {

    function testCanOnlyGetPublicIssues() {

    }

    function testGetMostRecentPublicIssueIfNoArgPassed() {

    }
}