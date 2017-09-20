<?php

use PHPUnit\Framework\TestCase;

require_once(__DIR__ . '/../vendor/autoload.php');

class UserTest extends TestCase {

    protected $userExistsQuery;

    function __constructor() {

       $userExistsQuery = '
                query users($profileLink: String, $id: ID) {
                    users(profileLink: $profileLink, id: $id) {
                    id
                }
            }';
    }

    /**
      * @param $args - @see HelpTests::createHTTPRequest param $args
      */
    protected function request(array $args = [], $jwt = '') {

        HelpTests::createHTTPRequest($args , 'users', $jwt);
    }

}
?>