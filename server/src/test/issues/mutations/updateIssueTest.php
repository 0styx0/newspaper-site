<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class UpdateIssueTest extends IssueTestHelper {

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

        $user = TestHelper::searchArray($this->Database->GenerateRows->users, function (array $currentUser, int $userLevel) {
            return $currentUser['level'] == $userLevel;
        }, $userLevel);

        $variablesStrings = TestHelper::convertVariableArrayToGraphql(array_merge($variableTypes, ['$password' => 'String!']));

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
        ], $loggedIn ? TestHelper::getJwt($user) : '');
    }

    function testCannotModifyIfNotLoggedIn() {

        $data = $this->helpTestArgs(['$name' => 'String'], ['name' => TestHelper::faker()->name()], false);
        $actualName = Db::query("SELECT name FROM issues WHERE num = ?", [$this->Database->GenerateRows->issues[0]['num']])->fetchColumn();

        $this->assertEquals($this->Database->GenerateRows->issues[0]['name'], $actualName);
    }

    function testCannotModifyIfBadPassword() {

        $data = $this->helpTestArgs(['$name' => 'String'], ['name' => TestHelper::faker()->word()],
          true, 3, false);

        $actualName = Db::query("SELECT name FROM issues WHERE num = ?", [$this->Database->GenerateRows->issues[0]['num']])->fetchColumn();
        $this->assertEquals($this->Database->GenerateRows->issues[0]['name'], $actualName);
    }

    function testCannotModifyIfLevelLessThanThree() {

        $data = $this->helpTestArgs(['$name' => 'String'], ['name' => TestHelper::faker()->word()], true, rand(1, 2));

        $actualName = Db::query("SELECT name FROM issues WHERE num = ?", [$this->Database->GenerateRows->issues[0]['num']])->fetchColumn();
        $this->assertEquals($this->Database->GenerateRows->issues[0]['name'], $actualName);
    }

    function testCanModifyName() {

        $newName = TestHelper::faker()->word();

        $data = $this->helpTestArgs(['$name' => 'String'], ['name' => $newName]);

        $actualName = Db::query("SELECT name FROM issues WHERE num = ?", [$this->Database->GenerateRows->issues[0]['num']])->fetchColumn();
        $this->assertEquals($newName, $actualName);
    }

    function testCanMakeIssuePublic() {

        $data = $this->helpTestArgs(['$public' => 'Boolean'], ['public' => true]);

        $actualPublicStatus = Db::query("SELECT ispublic, madepub FROM issues WHERE num = ?", [$this->Database->GenerateRows->issues[0]['num']])->fetchAll(PDO::FETCH_ASSOC)[0];
        $this->assertEquals(1, $actualPublicStatus['ispublic']);
        $this->assertEquals(date('Y-m-d'), $actualPublicStatus['madepub']);
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