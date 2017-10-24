<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

/**
 * Goal: Only users who exist, with proper email and password should be able to sign in
 */
class LoginTest extends LoginTest {

    protected function helpLogin(string $username, string $password) {

        return $this->request([
            'query' => 'mutation login($username: String!, $password: String!) {
                            login(username: $username, password: $password) {
                                jwt
                            }
                        }',
            'variables' => [
                'username' => $username,
                'password' => $password
            ]
        ])['jwt'];
    }

    function testBadUsername() {

        $faker = HelpTests::faker();
        $user = $faker->randomElement($this->Database->GenerateMockRows->users);

        $jwt = $this->helpLogin($user['username'] . $faker->randomWord(), $user['password']);

        $this->assertNull($jwt);
    }

    function testBadPassword() {

        $faker = HelpTests::faker();
        $user = $faker->randomElement($this->Database->GenerateMockRows->users);

        $jwt = $this->helpLogin($user['username'], $user['password'] . $faker->randomWord());

        $this->assertNull($jwt);
    }

    function testGoodPasswordGoodUsername() {

        $faker = HelpTests::faker();
        $user = $faker->randomElement($this->Database->GenerateMockRows->users);

        $jwt = $this->helpLogin($user['username'], $user['password']);

        $this->assertNotNull($jwt);
    }

    function testUnverifiedEmail() {

        $faker = HelpTests::faker();
        $user = $faker->randomElement($this->Database->GenerateMockRows->users);

        Db::query("UPDATE users SET email = CONCAT('.', email) WHERE id = ?", $user['id']);

        $jwt = $this->helpLogin($user['username'], $user['password']);

        $this->assertNotNull($jwt);

        throw new Error('See how to test that cannot fully log in until verify email');
    }
}
?>