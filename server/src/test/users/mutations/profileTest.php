<?php

// TODO: when stuff is changed, update TestDatabase

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class ProfileTest extends UserTest {

    /**
     * Checks if can mutate fields
     *
     * @param $user - a user (@see TestDatabase->users)
     * @param $variableTypes - assoc array [$field => type]
     * @param $variableValues - assoc array [field => value]
     * @param $runAssertions - {function (string $field, array $data)}, called on each field
     *  after attempted mutation. Run assertions here
     */
    function helpTestMutation($user, array $variableTypes, array $variableValues) {

        $variableStrings = HelpTests::convertVariableArrayToGraphql($variableTypes);

        $fields = str_replace('password', '', implode('', array_keys($variableValues)));
        $fields = str_replace('newPassword', 'id', $fields); // id is given so not an empty return stuff

        return $this->request([
            'query' => "mutation updateProfile({$variableStrings['types']}) {
                            updateProfile({$variableStrings['mappings']}) {
                                {$fields}
                            }
                        }",
            'variables' => $variableValues
        ], HelpTests::getJwt($user))['updateProfile'];
    }

    function testCannotModifyNotificationsWithoutPassword() {

        $user = HelpTests::faker()->randomElement($this->Database->GenerateRows->users);

        $data = $this->helpTestMutation($user, ['$notifications' => 'Boolean'],
          ['notifications' => !$user['notifications']]);

          $this->assertNull($data);
    }

    function testCanModifyOwnNotification() {

        $user = HelpTests::faker()->randomElement($this->Database->GenerateRows->users);

        $changedSetting = !$user['notifications'];

        $data = $this->helpTestMutation($user, ['$notifications' => 'Boolean', '$password' => 'String'],
          ['notifications' => $changedSetting, 'password' => $user['password']]);

          $this->assertEquals($changedSetting, $data['notifications']);
    }

    function testCannotModifyTwoFactorWithoutPassword() {

        $user = HelpTests::faker()->randomElement($this->Database->GenerateRows->users);

        $data = $this->helpTestMutation($user, ['$twoFactor' => 'Boolean'],
          ['twoFactor' => $user['two_fa_enabled']]);

          $this->assertNull($data);
    }

    function testCanModifyOwnTwoFactor() {

        $user = HelpTests::faker()->randomElement($this->Database->GenerateRows->users);

        $changedSetting = !$user['two_fa_enabled'];

        $data = $this->helpTestMutation($user, ['$twoFactor' => 'Boolean', '$password' => 'String'],
        ['twoFactor' => $changedSetting, 'password' => $user['password']]);

        $this->assertEquals($changedSetting, $data['twoFactor']);
    }

    /**
     * Checks if password is valid
     *
     * @param $user - TestDatabase user
     *
     * @return boolean
     */
    function helpTestPassword(array $user, string $expectedPassword, bool $assertTrue = true) {

        $actualPassword = Db::query("SELECT password FROM users WHERE id = ?", [$user['id']])->fetchAll(PDO::FETCH_ASSOC)[0]['password'];

        $correct = password_verify($expectedPassword, $actualPassword);

        if ($assertTrue) {

            $this->assertTrue($correct);
        } else {
            $this->assertFalse($correct);
        }
    }

    function testCanModifyOwnPassword() {

        $newPassword = $this->generateRandomString(7); // 7 = random

        $user = HelpTests::faker()->randomElement($this->Database->GenerateRows->users);

        $this->helpTestMutation($user, ['$newPassword' => 'String', '$password' => 'String'],
        ['newPassword' => $newPassword, 'password' => $user['password']]);

        $this->helpTestPassword($user, $newPassword);
    }

    function testCannotModifyPasswordWithoutPassword() {

        $newPassword = $this->generateRandomString(7);

        $user = HelpTests::faker()->randomElement($this->Database->GenerateRows->users);

        $this->helpTestMutation($user, ['$newPassword' => 'String'],
        ['newPassword' => $newPassword]);

        $this->helpTestPassword($user, $newPassword, false);
    }

    function testCanModifyMultipleAtOnce() {

        $user = HelpTests::faker()->randomElement($this->Database->GenerateRows->users);

        $params = [
            'notifications' => !$user['notifications'],
            'twoFactor' => !$user['two_fa_enabled'],
            'newPassword' => 'random sdfsasadf',
            'password' => $user['password']
        ];

        $data = $this->request([
            'query' => 'mutation updateProfile($password: String, $notifications: Boolean, $twoFactor: Boolean, $newPassword: String) {
                            updateProfile(password: $password, notifications: $notifications, twoFactor: $twoFactor, newPassword: $newPassword) {
                                notifications,
                                twoFactor
                            }
                        }',
            'variables' => $params
        ], HelpTests::getJwt($user))['updateProfile'];

        $this->assertEquals($params['notifications'], $data['notifications']);
        $this->assertEquals($params['twoFactor'], $data['twoFactor']);
        $this->helpTestPassword($user, $params['newPassword']);
    }
}

?>