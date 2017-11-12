<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

/**
 * Goal: Everyone can see it, only lvl 3 canEdit
 */
class MissionQueryTest extends MissionTest {

    /**
     *
     * @param $user - if passed, will be logged in as that user. If not given, not logged in
     *
     * @return graphql query for mission
     */
    protected function helpGetMission(array $user) {

        return $this->request([
            'query' => 'query missionQuery {
                            mission {
                                mission
                                canEdit
                            }
                        }'
        ], (isset($user)) ? HelpTests::getJwt($user) : '')['mission'];
    }

    function testCanSeeMission() {

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {
            return $currentUser['level'] === 1;
        });

        $mission = $this->helpGetMission($user);

        $this->assertNotNull($mission['mission']);
    }

    function testNonLevelThreeCannotEdit() {

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {
            return $currentUser['level'] < 3;
        });

        $mission = $this->helpGetMission($user);

        $this->assertFalse($mission['canEdit']);
    }

    function testLevelThreeCanEdit() {

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {
            return $currentUser['level'] > 2;
        });

        $mission = $this->helpGetMission($user);

        $this->assertTrue($mission['canEdit']);
    }
}
?>