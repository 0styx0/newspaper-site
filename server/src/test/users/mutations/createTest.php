<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class CreateUserTest extends UserTest {

    protected function helpGenerateRequiredUserFields() {

        $exampleUserRow = (new GenerateMockRow())->user(HelpTests::faker());

        return [
            'username' => $exampleUserRow['username'],
            'email' => $exampleUserRow['email'],
            'password' => $exampleUserRow['password'],
            'firstName' => $exampleUserRow['firstName'],
            'lastName' => $exampleUserRow['lastName']
        ];
    }

    /**
     * Generates keys for use in graphql
     *
     * @param $fields - assoc array
     *
     * @return stringified version of array_keys($fields), with [i]: $[i]
     *
     * @example helpGenerateKeyMappings(['name' => 'bob', 'level' => 2]) => "name: $name, level: $level"
     */
    protected function helpGenerateKeyMappings(array $fields) {

        $mappings = array_map(function ($elt) {
            return "{$elt}: ${$elt}";
        }, array_keys($fields));

        return implode(',', $mappings);
    }

    /**
     *
     * @param $fields - assoc array of graphql fields from User
     *
     * @return string with field: $typeOfField
     *
     * @example helpGetGraphqlTypes(['name' => 'bob', 'level' => 1]) => "name: String, level: Int"
     */
    protected function helpGetGraphqlTypes(array $fields) {

        $fieldsWithTypesArr = array_map(function ($elt) {

            $type = ($elt === 'level') ? 'Int' : 'String';
            return "${$elt}: {$type}";

        }, array_keys($fields));

        return implode(',', $fieldsWithTypesArr);
    }

    // if args that should be present, aren't expect error
    function testMustPassRequiredArgs() {

        $requiredFields = $this->helpGenerateRequiredUserFields();

        foreach ($requiredFields as $field) {

            $fieldsMinusOne = array_filter($requiredFields, function ($elt) {
                return $elt !== $field;
            });

            $variables = helpGetGraphqlTypes($fieldsMinusOne);

            $variableMapping = $this->helpGenerateKeyMappings($fieldsMinusOne);

            $data = $this->request([
                'query' => "mutation createUser({$variables}) {
                                createUser({$variableMapping}) {
                                    id
                                }
                            }",
                'variables' => $fieldsMinusOne
            ]);

            $fieldsPassed = array_keys($fieldsMinusOne);
            $this->assertFalse($data['users'][0]['id'], 'Missing ' . array_diff(array_keys($requiredFields), $fieldsPassed)[0]);
        }
    }

    // emails must end with domain specified in .env USER_EMAIL_HOST
    function testEmailMustBeSameAsEnvUserEmailHost() {

        $user = $this->helpGenerateRequiredUserFields();
        $types = $this->helpGetGraphqlTypes($user);
        $mappings = $this->helpGenerateKeyMappings($user);

        $user['email'] = explode('@', $user['email'])[0] . $_ENV['USER_EMAIL_HOST'] . rand();

        $data = $this->request([
            'query' => "mutation createUser({$types}) {
                            createUser({$mappings}) {
                                id
                            }
                        }",
            'variables' => $user
        ]);

        $this->assertNull($data['users'][0]['id']);
    }

    function testCorrectCreation() {

        $user = $this->helpGenerateRequiredUserFields();
        $types = $this->helpGetGraphqlTypes($user);
        $mappings = $this->helpGenerateKeyMappings($user);

        $data = $this->request([
            'query' => "mutation createUser({$types}) {
                            createUser({$mappings}) {
                                firstName
                                lastName
                                email
                                id
                            }
                        }",
            'variables' => $user
        ]);

        $newUser = $data['users'][0];

        $this->assertEqual($user['firstName'], $newUser['firstName']);
        $this->assertEqual($user['lastName'], $newUser['lastName']);
        $this->assertEqual($user['email'], $newUser['email']);
        $this->assertEqual($user['username'], $newUser['username']);
        $this->assertEqual($user['level'], $newUser['level']);

        $this->assertNotNull($db::query("SELECT id FROM users WHERE id = ?", [$newUser['id']])->fetchColumn());
    }

    function testLowerLevelCannotCreateHigherLevel() {

        $userToCreate = $this->helpGenerateRequiredUserFields();
        $types = $this->helpGetGraphqlTypes($userToCreate);
        $mappings = $this->helpGenerateKeyMappings($userToCreate);

        $userToCreate['level'] = rand(2, 3);

        $user = HelpTests::searchArray($this->GenerateRows->users, function ($currentUser, $userToCreate) {
           $currentUser['level'] < $userToCreate['level'];
        }, $userToCreate);

        $data = $this->request([
            'query' => "mutation createUser({$types}) {
                            createUser({$mappings}) {
                                id
                            }
                        }",
            'variables' => $userToCreate
        ], HelpTests::getJwt($user));

        $this->assertNull($data['users'][0]['id']);
    }

    function testHigherLevelCanCreateLowerOrSameLevel() {

        $userToCreate = $this->helpGenerateRequiredUserFields();
        $types = $this->helpGetGraphqlTypes($userToCreate);
        $mappings = $this->helpGenerateKeyMappings($userToCreate);

        $userToCreate['level'] = rand(1, 2);

        $user = HelpTests::searchArray($this->GenerateRows->users, function (array $currentUser, $userToCreate) {
           $currentUser['level'] >= $userToCreate['level'];
        }, $userToCreate);

        $data = $this->request([
            'query' => "mutation createUser({$types}) {
                            createUser({$mappings}) {
                                id
                                level
                            }
                        }",
            'variables' => $userToCreate
        ], HelpTests::getJwt($user));

        $newUser = $data['users'][0];

        $this->assertNotNull(Db::query("SELECT 1 FROM users WHERE id = ?", [$newUser['id']])->fetchColumn());
        $this->assertEqual($userToCreate['level'], $newUser['level']);
    }

    function testDefaultLevelIsOne() {

        $userToCreate = $this->helpGenerateRequiredUserFields();
        $types = $this->helpGetGraphqlTypes($userToCreate);
        $mappings = $this->helpGenerateKeyMappings($userToCreate);

        $data = $this->request([
            'query' => "mutation createUser({$types}) {
                            createUser({$mappings}) {
                                id
                                level
                            }
                        }",
            'variables' => $userToCreate
        ]);

        $newUser = $data['users'][0];

        $this->assertNotNull(Db::query("SELECT 1 FROM users WHERE id = ?", [$newUser['id']])->fetchColumn());
        $this->assertEqual(1, $newUser['level']);
    }
}

?>