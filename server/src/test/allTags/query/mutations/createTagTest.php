<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class CreateTagTest extends AllTagsTest {

    /**
     * Sends mutation to server to add tag
     *
     * @param $tag - tag to add
     * @param $user - user who will be adding the tag
     */
    protected function helpTest(string $tag, array $user) {

        return $this->request([
            'query' => 'mutation createTag($tag: String!) {
                            createTag(tag: $tag) {
                                tag
                            }
                        }',
            'variables' => [
                'tag' => $tag
            ]
        ], HelpTests::getJwt($user));
    }
    
    function testNotLevelThreeCannotAddTag() {

    }

    function testGoodLevelThreeCanAddTag() {

    }

    function testMaliciousDataNotAccepted() {

    }
}
?>