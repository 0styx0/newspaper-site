<?php

use PHPUnit\Framework\TestCase;

require_once(__DIR__ . '/../../../vendor/autoload.php');

class UserTest extends TestCase {

    protected $TestDatabase;

    protected function setup() {

        $this->TestDatabase = new TestDatabase();
        $this->TestDatabase->init();
    }

    protected function helpGetRandomUser() {

        return $this->TestDatabase->users[ rand(0, count($this->TestDatabase->users)) - 1 ];
    }

    /**
      * @param $args - @see HelpTests::createHTTPRequest param $args
      */
    protected function request(array $args = [], $jwt = '') {

        return HelpTests::createHTTPRequest($args , 'users', $jwt)['data'];
    }

}
?>