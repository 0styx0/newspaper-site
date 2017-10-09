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

        $variableArr = [];
        $keyMappingsArr = [];

        foreach ($variableTypes as $field => $type) {

            $variableArr[] = "{$field}: {$type}"; // $num: ID
            $keyMappingsArr[] = substr($field, 1) . ":{$field}"; // num: $num
        }

        $variablesString = implode(',', $variableArr);
        $keyMappingsString = implode(',', $keyMappingsArr);

        return $this->request([
            'query' => "query IssueInfo({$variablesString}) {
                            issues({$keyMappingsArr}) {
                                num
                                name
                            }
                        }",
            'variables' => $variableValues
        ], HelpTests::getJwt($this->Database->GenerateMockRows->users[0]));
    }

    function testCanQueryByNum() {

        $data = $this->helpTestArgs(['$num' => 'ID'], ['num' => $this->Database->GenerateRows->issues[0]['num']]);
        $this->assertNotNull($data['issues']);
    }

    function testCanQueryByPublicStatus() {

        $data = $this->helpTestArgs(['$public' => 'Boolean'], ['public' => 1]);
        $this->assertNotNull($data['issues']);
    }

    function testCanUseLimitArg() {

        $limit = rand(0, count($this->Database->GenerateMockRows->issues) - 1);

        $data = $this->helpTestArgs(['$limit' => 'Int'], ['limit' => $limit]);
        $this->assertEqual($limit, count($data['issues']));
    }
}
?>