<?php

use PHPUnit\Framework\TestCase;

require_once(__DIR__ . '/../../../vendor/autoload.php');

class CommentTest extends TestCase {

    protected $TestDatabase;

    protected function setup() {

        $this->Database = new TestDatabase();
        $this->Database->init();
    }

    /**
      * @param $args - @see HelpTests::createHTTPRequest param $args
      */
    protected function request(array $args = [], $jwt = '') {

        return HelpTests::createHTTPRequest($args , 'comments', $jwt)['data'];
    }
}
?>