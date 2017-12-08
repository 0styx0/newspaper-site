<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class AllTagsQueryTest extends AllTagsTestHelper {

    function testGetAllTags() {

        $data = $this->request([
            'query' => 'query allTags {
                            allTags
                        }'
        ]);

        $expectedTags = array_column($this->Database->GenerateRows->tag_list, 'tag');

        $this->compareArrayContents($expectedTags, $data['allTags']);
    }
}
?>