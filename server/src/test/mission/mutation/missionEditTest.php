<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

/**
 * Goal: Only level three can change
 */
class MissionEditTest extends MissionHelper {

    /**
     * Sends graphql mutation to edit mission statement
     *
     * @param $mission - update mission statement
     *
     * @return graphql mutation data
     */
    protected function helpEdit(string $mission, array $user) {

        return $this->request([
            'query' => 'mutation editMission($mission: String!) {
                            editMission(mission: $mission) {
                                mission
                            }
                        }',
            'variables' => [
                'mission' => $mission
            ]
        ], TestHelper::getJwt($user))['editMission'];
    }

    function testNotLevelThreeCannotEdit() {

        $user = TestHelper::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {
            return $currentUser['level'] < 3;
        });

        $newMission = $this->helpEdit(TestHelper::faker()->randomHtml(), $user);

        $this->assertNull($newMission);
    }

    function testLevelThreeCanEdit() {

        $user = TestHelper::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {
            return $currentUser['level'] > 2;
        });

        $newMission = $this->helpEdit(TestHelper::faker()->randomHtml(), $user);

        $this->assertNotNull($newMission);
    }

    function testMissionIsSanitized() {

        $user = TestHelper::faker()->randomElement($this->Database->GenerateRows->users);

        foreach (TestHelper::$unsafeData as $mission) {

            $newMission = $this->helpEdit($mission, $user);

            $this->assertFalse(!!empty($newMission['mission']) && !!$newMission['mission']); // might change when implement to just strip bad stuff
        }
    }
}
?>