<?php

use PHPUnit\Framework\TestCase;

require_once(__DIR__ . '/../../../vendor/autoload.php');

abstract class UserTestHelper extends TestHelper {

    protected $Database, $emailHost;

    protected function setup() {

        $this->emailHost = $_ENV['USER_EMAIL_HOST'];
        $_ENV['USER_EMAIL_HOST'] = '*';

        $this->Database = new TestDatabase();
        $this->Database->init();
    }

    protected function helpGetRandomUser() {

        return $this->Database->users[ rand(0, count($this->Database->users)) - 1 ];
    }

    /**
      * @param $args - @see TestHelper::createHTTPRequest param $args
      */
    protected function request(array $args = [], $jwt = '') {

        return TestHelper::createHTTPRequest($args , 'users', $jwt)['data'];
    }

    /**
     * @param $length - how long string should be
     *
     * @return random string
     */
    protected function generateRandomString(int $length) {

        return bin2hex(random_bytes($length));
    }

}
?>