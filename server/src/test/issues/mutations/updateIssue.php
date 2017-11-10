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
    protected function helpTestArgs(array $variableTypes, array $variableValues, bool $loggedIn = true,
      int $userLevel = 3, bool $correctPassword = true) {

        $user = HelpTests::searchArray($this->Database->GenerateRows->users, function (array $currentUser, int $userLevel) {
            return $currentUser['level'] == $userLevel;
        }, $userLevel);

        $variablesStrings = HelpTests::convertVariableArrayToGraphql(array_merge($variableTypes, ['$password' => 'String!']));

        if (!$correctPassword) {
            $user['password'] .= '.'; // the dot is random char to invalidate password
        }

        return $this->request([
            'query' => "mutation updateIssue({$variablesStrings['types']}) {
                            updateIssue({$variablesStrings['mappings']}) {
                                name
                                public
                            }
                        }",
            'variables' => array_merge($variableValues, ['password' => $user['password']])
        ], $loggedIn ? HelpTests::getJwt($user) : '');
    }

    function testCannotModifyIfNotLoggedIn() {

        $data = $this->helpTestArgs(['$name' => 'String'], ['name' => HelpTests::faker()->name()], false);
        $actualName = Db::query("SELECT name FROM issues WHERE num = ?", [$this->Database->GenerateRows->issues[0]['num']])->fetchColumn();

        $this->assertEquals($this->Database->GenerateRows->issues[0]['name'], $actualName);
    }

    function testCannotModifyIfBadPassword() {

        $data = $this->helpTestArgs(['$name' => 'String'], ['name' => HelpTests::faker()->word()],
          true, 3, false);

        $actualName = Db::query("SELECT name FROM issues WHERE num = ?", [$this->Database->GenerateRows->issues[0]['num']])->fetchColumn();
        $this->assertEquals($this->Database->GenerateRows->issues[0]['name'], $actualName);
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

        $data = $this->helpTestArgs(['$public' => 'Boolean'], ['public' => true]);

        $actualPublicStatus = Db::query("SELECT ispublic FROM issues WHERE num = ?", [$this->Database->GenerateRows->issues[0]['num']])->fetchColumn();
        $this->assertEquals(1, $actualPublicStatus);
    }

    function testCannotMakeIssuePrivate() {

        Db::query("UPDATE issues SET ispublic = 1");

        $data = $this->helpTestArgs(['$public' => 'Boolean'], ['public' => false]);

        $actualPublicStatus = Db::query("SELECT ispublic FROM issues WHERE num = ?", [$this->Database->GenerateRows->issues[0]['num']])->fetchColumn();

        $this->assertEquals(1, $actualPublicStatus);
        Db::query("UPDATE issues SET ispublic = 0");
    }
}
?>