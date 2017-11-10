<?php

use PHPUnit\Framework\TestCase;

require_once(__DIR__ . '/../../../vendor/autoload.php');

class LoginHelperTest extends HelpTests {

    protected $TestDatabase;

    protected function setup() {

        $this->TestDatabase = new TestDatabase();
        $this->TestDatabase->init();
    }

    /**
      * @param $args - @see HelpTests::createHTTPRequest param $args
      */
    protected function request(array $args = [], $jwt = '') {

        return HelpTests::createHTTPRequest($args , 'login', $jwt)['data'];
    }


}
?>