<?php

use PHPUnit\Framework\TestCase;

require_once(__DIR__ . '/../../../vendor/autoload.php');

abstract class RecoverPasswordHelper extends TestCase {

    protected $Database;

    protected function setup() {

        $this->Database = new TestDatabase();
        $this->Database->init();
    }

    /**
      * @param $args - @see TestHelper::createHTTPRequest param $args
      */
    protected function request(array $args = []) {

        return TestHelper::createHTTPRequest($args , 'recoverPassword', '')['data'];
    }
}
?>