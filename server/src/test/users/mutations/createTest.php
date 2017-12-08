<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class CreateUserTest extends UserTestHelper {


    protected function helpGenerateRequiredUserFields() {

        $exampleUserRow = $this->Database->GenerateRows->user();

        return [
            'username' => $exampleUserRow['username'],
            'email' => $exampleUserRow['email'],
            'password' => $exampleUserRow['password'],
            'firstName' => $exampleUserRow['f_name'],
            'lastName' => $exampleUserRow['l_name']
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
            return "{$elt}: \${$elt}";
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
            return "\${$elt}: {$type}";

        }, array_keys($fields));

        return implode(',', $fieldsWithTypesArr);
    }

    // if args that should be present, aren't expect error
    function testMustPassRequiredArgs() {

        $requiredFields = $this->helpGenerateRequiredUserFields();

        foreach ($requiredFields as $key => $field) {

            $fieldsMinusOne = $requiredFields;
            unset($fieldsMinusOne[$key]);

            $variables = $this->helpGetGraphqlTypes($fieldsMinusOne);

            $variableMapping = $this->helpGenerateKeyMappings($fieldsMinusOne);

            $data = $this->request([
                'query' => "mutation createUser({$variables}) {
                                createUser({$variableMapping}) {
                                    id
                                }
                            }",
                'variables' => $fieldsMinusOne
            ])['createUser'];

            $fieldsPassed = array_keys($fieldsMinusOne);
            $this->assertEmpty($data, ['Missing ', array_diff(array_keys($requiredFields), $fieldsPassed)]);
        }
    }

    // emails must end with domain specified in .env USER_EMAIL_HOST
    function testEmailMustBeSameAsEnvUserEmailHost() {

        $_ENV['USER_EMAIL_HOST'] = $this->emailHost;

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

        $_ENV['USER_EMAIL_HOST'] = '*';
        $this->assertNull($data['createUser']['id']);
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
                                level
                            }
                        }",
            'variables' => $user
        ]);

        $newUser = $data['createUser'];

        $this->assertEquals($user['firstName'], $newUser['firstName']);
        $this->assertEquals($user['lastName'], $newUser['lastName']);
        $this->assertEquals($user['email'], $newUser['email']);
        $this->assertEquals(1, $newUser['level']);

        $this->assertNotNull(Db::query("SELECT id FROM users WHERE id = ?", [$newUser['id']])->fetchColumn());
    }

    function testLowerLevelCannotCreateHigherLevel() {

        $userToCreate = $this->helpGenerateRequiredUserFields();
        $userToCreate['level'] = rand(2, 3);

        $types = $this->helpGetGraphqlTypes($userToCreate);
        $mappings = $this->helpGenerateKeyMappings($userToCreate);


        $user = TestHelper::searchArray($this->Database->GenerateRows->users, function ($currentUser, $userToCreate) {
           return $currentUser['level'] < $userToCreate['level'];
        }, $userToCreate);

        $data = $this->request([
            'query' => "mutation createUser({$types}) {
                            createUser({$mappings}) {
                                id
                            }
                        }",
            'variables' => $userToCreate
        ], TestHelper::getJwt($user));

        $this->assertNull($data['createUser']['id']);
    }

    function testHigherLevelCanCreateLowerOrSameLevel() {

        $userToCreate = $this->helpGenerateRequiredUserFields();
        $userToCreate['level'] = rand(1, 3);

        $types = $this->helpGetGraphqlTypes($userToCreate);
        $mappings = $this->helpGenerateKeyMappings($userToCreate);

        $user = TestHelper::searchArray($this->Database->GenerateRows->users, function (array $currentUser, $userToCreate) {
           return $currentUser['level'] >= $userToCreate['level'];
        }, $userToCreate);

        $data = $this->request([
            'query' => "mutation createUser({$types}) {
                            createUser({$mappings}) {
                                id
                                level
                            }
                        }",
            'variables' => $userToCreate
        ], TestHelper::getJwt($user));

        $newUser = $data['createUser'];

        $this->assertNotNull(Db::query("SELECT 1 FROM users WHERE id = ?", [$newUser['id']])->fetchColumn());
        $this->assertEquals($userToCreate['level'], $newUser['level']);
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

        $newUser = $data['createUser'];

        $this->assertNotNull(Db::query("SELECT 1 FROM users WHERE id = ?", [$newUser['id']])->fetchColumn());
        $this->assertEquals(1, $newUser['level']);
    }
}

?>