<?php

// TODO: when stuff is changed, update TestDatabase

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class ProfileTest extends UserTest {

    /**
     * Checks if can mutate fields
     *
     * @param $user - a user (@see TestDatabase->users[0])
     * @param $data - assoc array [field => value];
     * @param $runAssertions - {function (string $field, array $data)}, called on each field
     *  after attempted mutation. Run assertions here
     */
    function helpTestMutation($user, array $data, callable $runAssertions) {

        $typeInfo = '';
        $actualValuesArr = [];

        foreach ($data as $field => $value) {

            $type = gettype($value);
            $typeInfo .= "\${$field}: {$type}"; // $notifications: String

            $actualValuesArr[] = "{$field}: \${$field}"; // notifications: $notifications
        }

        $fieldsArr = array_column($data, 'field');
        $fields = str_replace('password,\n', '', implode(",\n", array_keys($data))); // password isn't a queryable field
        $actualValues = implode(',', $actualValuesArr);

        $data = $this->request([
            'query' => "mutation updateProfile({$typeInfo}) {
                            updateProfile({$actualValues}) {
                                {$fields}
                            }
                        }",
            'variables' => $data
        ], HelpTests::getJwt($user));

        $runAssertions($data['users'][0]);
    }

    /**
     * Checks if mutation can happen without a password given
     *
     * @param $gQlField - graphql field name
     * @param $dbField - name in database corresponding
     */
    function helpTestWithoutPassword(string $gQlField, string $dbField) {

        $user = $this->getRandomUser();
        $toChange = [
            $gQlField => !$user[$dbField]
        ];

        $this->helpTestMutation($user, $toChange, function (array $data) {
            $this->assertArrayNotHasKey($gQlField, $data);
        });

        return $user;
    }

    // can't use this for passwords since can't query password with graphql
    function helpTestCorrectInfo(string $gQlField, string $dbField, $value = null) {

        $user = $this->getRandomUser();
        $newValue = $value || !$user[$dbField];

        $toChange = [
            $gQlField => $newValue,
            'password' => $user['password']
        ];

        $this->helpTestMutation($user, $toChange, function (array $data) {

            $this->assertEquals($newValue, $data[$gQlField]);
        });

        return $user;
    }

    function testCannotModifyNotificationsWithoutPassword() {
        $this->helpTestWithoutPassword('notificationStatus', 'notifications');
    }

    function testCanModifyOwnNotification() {

        $this->helpTestCorrectInfo('notificationStatus', 'notifications');
    }

    function testCannotModifyTwoFactorWithoutPassword() {

        $this->helpTestWithoutPassword('twoFactor', 'two_fa_enabled');
    }

    function testCanModifyOwnTwoFactor() {

        $this->helpTestCorrectInfo('twoFactor', 'two_fa_enabled');
    }

    /**
     * Checks if password is valid
     *
     * @param $user - TestDatabase user
     *
     * @return boolean
     */
    function helpTestPassword(array $user, string $expectedPassword) {

        $actualPassword = Db::query("SELECT password FROM users WHERE id = ?", [$user['id']])->fetchAll(PDO::FETCH_ASSOC)[0]['password'];

        $this->assertTrue(password_verify($expectedPassword, $actualPassword));
    }

    function testCanModifyOwnPassword() {

        $newPassword = $this->generateRandomString(rand(7));

        $user = $this->helpTestCorrectInfo('newPassword', 'password', $newPassword);
        $this->helpTestPassword($user, $newPassword);
    }

    function testCannotModifyPasswordWithoutPassword() {

        $newPassword = $this->generateRandomString(rand(7));

        $user = $this->helpTestWithoutPassword('newPassword', 'password', $newPassword);
        $this->helpTestPassword($user, $newPassword);
    }

    function testCanModifyMultipleAtOnce() {

        $user = $this->getRandomUser();

        $params = [
            'notificationStatus' => !$user['notifications'],
            'twoFactor' => !$user['twoFactor'],
            'newPassword' => 'random sdfsasadf',
            'password' => $user['password']
        ];

        $data = $this->request([
            'query' => 'mutation updateProfile($notificationStatus: Boolean, $twoFactor: Boolean, $newPassword: String) {
                            updateProfile(notificationStatus: $notificationStatus, twoFactor: $twoFactor, newPassword: $newPassword) {
                                notifications,
                                twoFactor
                            }
                        }',
            'variables' => $params
        ], HelpTests::getJwt($user))['users'][0];

        $this->assertEquals($params['notifications'], $data['notifications']);
        $this->assertEquals($params['twoFactor'], $data['twoFactor']);
        $this->helpTestPassword($user, $params['newPassword']);
    }
}

?>