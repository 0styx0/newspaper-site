<?php

require_once(__DIR__ . '/../../../vendor/autoload.php');
require_once(__DIR__ . '/helpers.php');

/**
 * Goal: Only users who exist, with proper email and password should be able to sign in
 */
class LoginTest extends LoginHelperTest {

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
        ])['login'];
    }

    function testBadUsername() {

        $faker = HelpTests::faker();
        $user = $faker->randomElement($this->Database->GenerateRows->users);

        $jwt = $this->helpLogin($user['username'] . $faker->word(), $user['password']);

        $this->assertNull($jwt);
    }

    function testBadPassword() {

        $faker = HelpTests::faker();
        $user = $faker->randomElement($this->Database->GenerateRows->users);

        $jwt = $this->helpLogin($user['username'], $user['password'] . $faker->word());

        $this->assertNull($jwt);
    }

    function testGoodPasswordGoodUsername() {

        $faker = HelpTests::faker();
        $user = $faker->randomElement($this->Database->GenerateRows->users);

        $jwt = $this->helpLogin($user['username'], $user['password']);

        $this->assertNotNull($jwt);
    }

    function testBadUnverifiedEmail() {

        $faker = HelpTests::faker();
        $user = $faker->randomElement($this->Database->GenerateRows->users);

        Db::query("UPDATE users SET email = CONCAT('.', email) WHERE id = ?", [$user['id']]);

        $jwt = $this->helpLogin($user['username'], $user['password']);

        $unwantedKeys = ['level', 'profileLink'];

        $decodedJwt = (array) HelpTests::decodeJwt($jwt['jwt'])->getClaims();

        $jwtDif = array_diff(array_merge(['id'], $unwantedKeys), array_keys($decodedJwt));

        HelpTests::compareArrayContents($unwantedKeys, $jwtDif);
    }
}
?>