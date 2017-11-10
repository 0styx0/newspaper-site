<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class UpdateIssueTest extends IssueTest {

    /**
     * Sends graphql query
     *
     * @param $variableTypes - graphql variables with type. Example: ['$num: => 'ID', '$limit': 'Int']
     * @param $variableValues - values to give variables listed as keys to $variableTypes
     * @param $loggedIn - if user is logged in or not
     * @param $userLevel - what level user should be
     */
    protected function helpTestArgs(array $variableTypes, array $variableValues, bool $loggedIn = true, int $userLevel = 3) {

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {
            $currentUser['level'] == $userLevel;
        });

        $variablesStrings = HelpTests::convertVariableArrayToGraphql(array_merge($variableTypes, ['$password' => 'String']));

        return $this->request([
            'query' => "mutation updateIssue({$variablesStrings['types']}) {
                            updateIssue({$variablesStrings['mappings']}) {
                                name
                                public
                            }
                        }",
            'variables' => $variableValues
        ], $loggedIn ? HelpTests::getJwt($user) : '');
    }

    function testCannotModifyIfNotLoggedIn() {

        $data = $this->helpTestArgs(['$name' => 'String'], ['name' => HelpTests::faker()->name()], false);
        $actualName = Db::query("SELECT name FROM issues WHERE num = ?", [$this->Database->GenerateRows->issues[0]['num']])->fetchColumn();

        $this->assertEquals($this->Database->GenerateRows->issues[0]['name'], $actualName);
    }

    function testCannotModifyIfBadPassword() {

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {
            $currentUser['level'] == 3;
        });

        $actualPassword = $user['password'];
        $user['password'] = HelpTests::faker()->word();

        $data = $this->helpTestArgs(['$name' => 'String'], ['name' => HelpTests::faker()->word()]);

        $actualName = Db::query("SELECT name FROM issues WHERE num = ?", [$this->Database->GenerateRows->issues[0]['num']])->fetchColumn();
        $this->assertEquals($this->Database->GenerateRows->issues[0]['name'], $actualName);

        $user['password'] = $actualPassword;
    }

    function testCannotModifyIfLevelLessThanThree() {

        $data = $this->helpTestArgs(['$name' => 'String'], ['name' => HelpTests::faker()->word()], true, rand(1, 2));

        $actualName = Db::query("SELECT name FROM issues WHERE num = ?", [$this->Database->GenerateRows->issues[0]['num']])->fetchColumn();
        $this->assertEquals($this->Database->GenerateRows->issues[0]['name'], $actualName);
    }

    function testCanModifyName() {

        $newName = HelpTests::faker()->word();

        $data = $this->helpTestArgs(['$name' => 'String'], ['name' => $newName]);

        $actualName = Db::query("SELECT name FROM issues WHERE num = ?", [$this->Database->GenerateRows->issues[0]['num']])->fetchColumn();
        $this->assertEquals($newName, $actualName);
    }

    function testCanMakeIssuePublic() {

        $data = $this->helpTestArgs(['$public' => 'Boolean'], ['public' => 1]);

        $actualPublicStatus = Db::query("SELECT public FROM issues WHERE num = ?", [$this->Database->GenerateRows->issues[0]['num']])->fetchColumn();
        $this->assertEquals(1, $actualPublicStatus);
    }

    function testCannotMakeIssuePrivate() {

        $data = $this->helpTestArgs(['$public' => 'Boolean'], ['public' => 0]);

        $actualPublicStatus = Db::query("SELECT public FROM issues WHERE num = ?", [$this->Database->GenerateRows->issues[0]['num']])->fetchColumn();
        $this->assertEquals(1, $actualPublicStatus);
    }
}
?>