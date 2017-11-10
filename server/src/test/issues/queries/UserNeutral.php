<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class NeutralIssueTest extends IssueTest {

    /**
     * Sends graphql query
     *
     * @param $variableTypes - graphql variables with type. Example: ['$num: => 'ID', '$limit': 'Int']
     * @param $variableValues - values to give variables listed as keys to $variableTypes
     */
    protected function helpTestArgs(array $variableTypes, array $variableValues) {

        $variableStrings = HelpTests::convertVariableArrayToGraphql($variableTypes);

        return $this->request([
            'query' => "query IssueInfo({$variableStrings['types']}) {
                            issues({$variableStrings['mappings']}) {
                                num
                                name
                            }
                        }",
            'variables' => $variableValues
        ]);
    }

    function testCanQueryByNum() {

        $data = $this->helpTestArgs(['$num' => 'ID'], ['num' => $this->Database->GenerateRows->issues[0]['num']]);
        $this->assertNotNull($data['issues']);
    }

    function testCanQueryByPublicStatus() {

        $data = $this->helpTestArgs(['$public' => 'Boolean'], ['public' => true]);
        $this->assertNotNull($data['issues']);
    }

    function testCanUseLimitArg() {

        $limit = rand(0, count($this->Database->GenerateRows->issues) - 1);

        $data = $this->helpTestArgs(['$limit' => 'Int'], ['limit' => $limit]);
        $this->assertEquals($limit, count($data['issues']));
    }
}
?>