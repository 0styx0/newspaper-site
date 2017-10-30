<?php

use PHPUnit\Framework\TestCase;

require_once(__DIR__ . '/../../../vendor/autoload.php');

class ArticleTest extends HelpTests {

    protected $Database;

    protected function setup() {

        $this->Database = new TestDatabase();
        $this->Database->init();
    }

    /**
     * @param $args - @see HelpTests::createHTTPRequest param $args
     */
    protected function request(array $args = [], $jwt = '') {

        $result = HelpTests::createHTTPRequest($args , 'articles', $jwt);

        return $result['data'];
    }
}
?>