<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class CreateArticleTest extends ArticleTest {

    function testNotLoggedInCannotCreate() {

    }

    function testArticleMustHaveAtLeastOneTag() {

    }

    function testArticleMustHaveUrl() {

    }

    function testArticleIsInMostRecentPrivateIssue() {

    }

    // if all issues are public, then a new issue is created with new article in it
    function testIfNoPrivateIssuePrivateIssueIsCreated() {

    }
}
?>