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

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {
            return $currentUser['level'] < 3;
        });

        $tag = HelpTests::faker()->randomWord();

        $data = $this->helpTest($tag, $user);

        $this->assertNull($data['tag']);
    }

    function testGoodLevelThreeCanAddTag() {

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {
            return $currentUser['level'] > 2;
        });

        $tag = HelpTests::faker()->randomWord();

        $data = $this->helpTest($tag, $user);

        $this->assertEquals($tag, $data['tag']);
    }

    function testMaliciousDataNotAccepted() {

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {
            return $currentUser['level'] > 2;
        });

        foreach (HelpTests::unsafeData as $tag) {

            $data = $this->helpTest($tag, $user);

            $this->assertNull($data['tag']);
            $dbTag = Db::query("SELECT tag FROM tag_list WHERE tag = ?", [$tag])->fetchColumn();

            $this->assertNull($dbTag);
        }
    }
}
?>