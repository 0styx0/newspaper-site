<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class NeutralUserCommentTest extends CommentTest {

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
            'query' => "query CommentQuery({$variablesString}) {
                            comments({$keyMappingsString}) {
                                id
                                content,
                                dateCreated,
                                canDelete
                            }
                        }",
            'variables' => $variableValues
        ]);
    }

    function testCanQueryById() {

        $comment = HelpTests::faker()->randomElement($this->Database->GenerateMockRows->comments);

        $data = $this->helpTestArgs(['$id' => 'ID'], ['id' => $comment['id']]);

        $this->assertNotNull($data['comments']);
    }

    function testCanQueryByAuthorId() {

        $comment = HelpTests::faker()->randomElement($this->Database->GenerateMockRows->comments);

        $data = $this->helpTestArgs(['$authorid' => 'ID'], ['authorid' => $comment['authorid']]);

        $this->assertNotNull($data['comments']);
    }

    function testCanQueryByArtId() {

        $comment = HelpTests::faker()->randomElement($this->Database->GenerateMockRows->comments);

        $data = $this->helpTestArgs(['$artId' => 'ID'], ['artId' => $comment['art_id']]);

        $this->assertNotNull($data['comments']);
    }
}
?>