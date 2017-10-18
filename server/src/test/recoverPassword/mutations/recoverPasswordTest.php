<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class RecoverTest extends RecoverPasswordTest {

    /**
     * Sends graphql query to generate new password
     *
     * @param $email - email of user who wants a new password
     * @param $authCode - auth code sent when doing 2fa or when verifying email - whichever is most recent
     * @param $username - username of user
     *
     * @return graphql data
     */
    protected function helpQuery(string $email, string $authCode, string $username) {

        return $this->request([
            'query' => 'mutation recoverPassword($email: String!, $authCode: String!, $username: String!) {
                            recoverPassword(email: $email, authCode: $authCode, username: $username) {
                                message
                            }
                        }',
            'variables' => [
                'email' => $email,
                'authCode' => $authCode,
                'username' => $username
            ]
        ]);
    }

    /**
     * Checks if password was changed
     *
     * @param $user - GenerateMockRows->users element (with original password)
     *
     * @return boolean if password changed or not
     */
    protected function helpCheckPasswordChanged(array $user) {

        $dbPassword = Db::query("SELECT password FROM users WHERE email = ?", [$user['email']])->fetchColumn();

        return !password_verify($user['password'], $dbPassword);
    }

    /**
     *
     * @param $fieldToTest - index of GenerateMockRows->user element
     *
     * @return ['user' => random_element_of_GenerateMockRows->users, 'fieldToTest' => incorrect_value_of_$fieldToTest]
     */
    protected function helpGetBadData(string $fieldToTest) {

        $faker = HelpTests::faker();

        $user = $faker->randomElement($this->Database->GenerateMockRows->users);
        $badValue = $user[$fieldToTest] . $faker->randomWord();

        return ['user' => $user, 'fieldToTest' => $badValue];
    }

    function testBadIncorrectUsername() {

        $randomUser = $this->helpGetBadData('username');

        $data = $this->helpQuery($randomUser['user']['email'], $randomUser['user']['auth_code'], $randomUser['fieldToTest']);

        $this->assertNull($data); // response subject to change

        $this->assertFalse($this->helpCheckPasswordChanged($randomUser['user']));
    }

    function testBadIncorrectEmail() {

        $randomUser = $this->helpGetBadData('email');

        $data = $this->helpQuery($randomUser['fieldToTest'], $randomUser['user']['auth_code'], $randomUser['user']['username']);

        $this->assertNull($data); // response subject to change

        $this->assertFalse($this->helpCheckPasswordChanged($randomUser['user']));
    }

    function testBadIncorrectAuthCode() {

        $randomUser = $this->helpGetBadData('auth_code');

        $data = $this->helpQuery($randomUser['user']['email'], $randomUser['fieldToTest'], $randomUser['user']['username']);

        $this->assertNull($data); // response subject to change

        $this->assertFalse($this->helpCheckPasswordChanged($randomUser['user']));
    }

    function testGood() {

        $randomUser = $this->helpGetBadData('auth_code')['user']; // auth_code is not relevant to this test, but need to pass a param

        $data = $this->helpQuery($randomUser['email'], $randomUser['auth_code'], $randomUser['username']);

        $this->assertNonNull($data);

        $this->assertTrue($this->helpCheckPasswordChanged($randomUser['user']));
    }
}
?>