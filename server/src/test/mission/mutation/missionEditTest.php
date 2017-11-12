<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

/**
 * Goal: Only level three can change
 */
class MissionEditTest extends MissionTest {

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
        ], HelpTests::getJwt($user));
    }

    function testNotLevelThreeCannotEdit() {

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {
            return $currentUser['level'] < 3;
        });

        $newMission = $this->helpEdit(HelpTests::faker()->randomHtml(), $user);

        $this->assertNull($newMission);
    }

    function testLevelThreeCanEdit() {

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {
            return $currentUser['level'] > 2;
        });

        $newMission = $this->helpEdit(HelpTests::faker()->randomHtml(), $user);

        $this->assertNonNull($newMission);
    }

    function testMissionIsSanitized() {

        $user = HelpTests::faker()->randomElement($this->Database->GenerateRows->users);

        foreach (HelpTests::unsafeData as $mission) {

            $newMission = $this->helpEdit($mission, $user);

            $this->assertNull($newMission); // might change when implement to just strip bad stuff
        }
    }
}
?>