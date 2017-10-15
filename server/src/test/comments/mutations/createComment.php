<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class CreateCommentTest extends CommentTest {

    function testBadNotLoggedIn() {

    }

    function testContentCannotBeBlank() {

    }

    function testCanCommentOnPublicArticles() {

    }

    function testGoodCannotCommentOnPrivateArticles() {

    }

    function testContentCannotBeMalicious() { // bad content should be converted to nothing or escaped

    }

    function testCommentAuthorShouldBeCurrentLoggedInUser() {

    }

    function testCommentArticleShouldBeFromArticleId() {
        
    }
}
?>