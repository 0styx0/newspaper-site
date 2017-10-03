<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class DeleteArticleTest extends ArticleTest {

    function testNotLevelThreeNotOwnerCannotDelete() {

    }

    function testOwnerCanDeleteArticle() {

    }

    function testLevelThreeCanDeleteArticle() {

    }

    function testCannotUseIncorrectPassword() {
        
    }
}
?>