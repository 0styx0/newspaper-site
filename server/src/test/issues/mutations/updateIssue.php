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

        $user = HelpTests::searchArray($this->Database->GenerateMockRows->users, function (array $currentUser) {
            $currentUser['level'] == $userLevel;
        });

        $variableArr = ['$password: String'];
        $keyMappingsArr = ['password: $password'];

        foreach ($variableTypes as $field => $type) {

            $variableArr[] = "{$field}: {$type}"; // $num: ID
            $keyMappingsArr[] = substr($field, 1) . ":{$field}"; // num: $num
        }

        $variablesString = implode(',', $variableArr);
        $keyMappingsString = implode(',', $keyMappingsArr);

        return $this->request([
            'query' => "mutation updateIssue({$variablesString}) {
                            updateIssue($keyMappingsString) {
                                name
                                public
                            }
                        }",
            'variables' => $variableValues
        ], $loggedIn ? HelpTests::getJwt($user) : '');
    }

    function testCannotModifyIfNotLoggedIn() {

        $data = $this->helpTestArgs(['$name' => 'String'], ['name' => HelpTests::faker()->randomWord()], false);
        $actualName = Db::query("SELECT name FROM issues WHERE num = ?", [$this->Database->GenerateMockRows->issues[0]['num']])->fetchColumn();

        $this->assertEqual($this->Database->GenerateMockRows->issues[0]['name'], $actualName);
    }

    function testCannotModifyIfBadPassword() {

        $user = HelpTests::searchArray($this->Database->GenerateMockRows->users, function (array $currentUser) {
            $currentUser['level'] == 3;
        });

        $actualPassword = $user['password'];
        $user['password'] = HelpTests::faker()->randomWord();

        $data = $this->helpTestArgs(['$name' => 'String'], ['name' => HelpTests::faker()->randomWord()]);

        $actualName = Db::query("SELECT name FROM issues WHERE num = ?", [$this->Database->GenerateMockRows->issues[0]['num']])->fetchColumn();
        $this->assertEqual($this->Database->GenerateMockRows->issues[0]['name'], $actualName);

        $user['password'] = $actualPassword;
    }

    function testCannotModifyIfLevelLessThanThree() {

        $data = $this->helpTestArgs(['$name' => 'String'], ['name' => HelpTests::faker()->randomWord()], true, rand(1, 2));

        $actualName = Db::query("SELECT name FROM issues WHERE num = ?", [$this->Database->GenerateMockRows->issues[0]['num']])->fetchColumn();
        $this->assertEqual($this->Database->GenerateMockRows->issues[0]['name'], $actualName);
    }

    function testCanModifyName() {

        $newName = HelpTests::faker()->randomWord();

        $data = $this->helpTestArgs(['$name' => 'String'], ['name' => $newName]);

        $actualName = Db::query("SELECT name FROM issues WHERE num = ?", [$this->Database->GenerateMockRows->issues[0]['num']])->fetchColumn();
        $this->assertEqual($newName, $actualName);
    }

    function testCanMakeIssuePublic() {

        $data = $this->helpTestArgs(['$public' => 'Boolean'], ['public' => 1]);

        $actualPublicStatus = Db::query("SELECT public FROM issues WHERE num = ?", [$this->Database->GenerateMockRows->issues[0]['num']])->fetchColumn();
        $this->assertEqual(1, $actualPublicStatus);
    }

    function testCannotMakeIssuePrivate() {

        $data = $this->helpTestArgs(['$public' => 'Boolean'], ['public' => 0]);

        $actualPublicStatus = Db::query("SELECT public FROM issues WHERE num = ?", [$this->Database->GenerateMockRows->issues[0]['num']])->fetchColumn();
        $this->assertEqual(1, $actualPublicStatus);
    }
}
?>