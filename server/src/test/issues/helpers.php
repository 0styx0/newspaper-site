<?php

use PHPUnit\Framework\TestCase;

require_once(__DIR__ . '/../../../vendor/autoload.php');

abstract class IssueTestHelper extends TestHelper {

    protected $Database;

    protected function setup() {

        $this->Database = new TestDatabase();
        $this->Database->init();
    }

    /**
      * @param $args - @see TestHelper::createHTTPRequest param $args
      */
    protected function request(array $args = [], $jwt = '') {

        return TestHelper::createHTTPRequest($args , 'issues', $jwt)['data'];
    }
}
?>