<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class CreateUserTest extends UserTest {

    // if args that should be present, aren't expect error
    function testRequireRequiredArgs() {

        $exampleUserRow = (new GenerateMockRow())->user(HelpTests::faker());

        $requiredFields = [
            'username' => $exampleUserRow['username'],
            'email' => $exampleUserRow['email'],
            'password' => $exampleUserRow['password'],
            'level' => $exampleUserRow['level'],
            'firstName' => $exampleUserRow['firstName'],
            'lastName' => $exampleUserRow['lastName']
        ];

        foreach ($requiredFields as $field) {

            $fieldsMinusOne = array_filter($requiredFields, function ($elt) {
                return $elt !== $field;
            });

            $fieldsPassed = array_keys($fieldsMinusOne);

            $variableArr = array_map(function ($elt) {

                $type = ($elt === 'level') ? 'Int' : 'String';
                return "${$elt}: {$type}";

            }, $fieldsPassed);

            $variables = implode(',', $variableArr);


            $variableMapping = array_map(function ($elt) {
                return "{$elt}: ${$elt}";
            }, $fieldsPassed);

            $data = $this->request([
                'query' => "mutation createUser({$variables}) {
                                createUser({$variableMapping}) {
                                    id
                                }
                            }",
                'variables' => $fieldsMinusOne
            ]);

            $this->assertFalse($data['users'][0]['id'], 'Missing ' . array_diff(array_keys($requiredFields), $fieldsPassed)[0]);
        }
    }

}

?>