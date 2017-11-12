<?php

use PHPUnit\Framework\TestCase;

require_once(__DIR__ . '/../../../vendor/autoload.php');

class UserTest extends HelpTests {

    protected $Database, $emailHost;

    protected function setup() {

        $this->emailHost = $_ENV['USER_EMAIL_HOST'];
        $_ENV['USER_EMAIL_HOST'] = '*';

        $this->Database = new TestDatabase();
        $this->Database->init();
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