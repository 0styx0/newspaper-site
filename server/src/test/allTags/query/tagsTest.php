<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class AllTagsQueryTest extends AllTagsTest {

    function testGetAllTags() {

        $data = $this->request([
            'query' => 'query allTags {
                            allTags
                        }'
        ]);

        $expectedTags = array_column($this->Database->GenerateRows->tag_list, 'tag');

        HelpTests::compareArrayContents($expectedTags, $data['allTags']);
    }
}
?>