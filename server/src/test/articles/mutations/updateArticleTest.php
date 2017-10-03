<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class UpdateArticleTest extends ArticleTest {

    function testNotLoggedInCannotEditAnyText() {

    }

    function testNotLoggedInCannotEditDisplayOrder() {

    }

    function testNotLoggedInCannotEditTags() {

    }

    function testCanEditOwnArticleText() {

    }

    function testCanEditAnyArticleTextIfLevelGreaterThanTwo() {

    }

    function testCannotEditIfWrongPassword() {

    }

    function testLevelThreeCanModifyDisplayOrder() {

    }

    function testLevelThreeCanModifyTags() {

    }
}
?>