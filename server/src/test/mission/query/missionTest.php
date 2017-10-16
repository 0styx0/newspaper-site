<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

/**
 * Goal: Everyone can see it, only lvl 3 canEdit
 */
class MissionTest extends MissionTest {

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
                            }
                        }'
        ], (isset($user)) ? HelpTests::getJwt($user) : '');
    }

    function testCanSeeMission() {

        $mission = $this->helpGetMission();

        $this->assertNotNull($mission);
    }

    function testNonLevelThreeCannotEdit() {

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {
            return $user['level'] < 3;
        });

        $mission = $this->helpGetMission($user);

        $this->assertFalse($mission['canEdit']);
    }

    function testLevelThreeCanEdit() {

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {
            return $user['level'] > 2;
        });

        $mission = $this->helpGetMission($user);

        $this->assertTrue($mission['canEdit']);
    }
}
?>