<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class VerifyTest extends VerifyEmailTestHelper {

    protected function helpSendQuery(array $user, bool $validCode = true) {

        return $this->request([
            'query' => 'mutation verifyEmail($authCode: String!) {
                            verifyEmail(authCode: $authCode) {
                                jwt
                            }
                        }',
            'variables' => [
                'authCode' => $validCode ? $user['auth'] : $user['auth'] . TestHelper::faker()->word()
            ]
        ], TestHelper::getJwt($user))['verifyEmail'];
    }

    /**
     *
     * @param $emailIsVerified - bool if should get user with a verified email or not
     *
     * @return user
     */
    protected function helpGetUser(bool $emailIsVerified = false) {

        $user = TestHelper::faker()->randomElement($this->Database->GenerateRows->users);

        if (!$emailIsVerified) {

            $date = new DateTime();
            $date->modify('+1 day');
            $dateString = $date->format('Y-m-d');

            Db::query("UPDATE users SET email = CONCAT('.', email), auth_time = ? WHERE id = ?",
              [$dateString, $user['id']]);
            $user['email'] = '.' . $user['email'];
            $user['auth_time'] = $dateString;
        }

        return $user;
    }

    protected function helpCheckIfEmailWasVerified(array $user) {

        $dbEmail = Db::query("SELECT email FROM users WHERE id = ?", [$user['id']])->fetchColumn();

        if ($user['email'][0] === '.') {
            return $dbEmail === substr($user['email'], 1);
        }

        return $dbEmail == $user['email']; // would be false if not verified b/c of @see #helpGetUser
    }

    function testBadAuthCode() {

        $user = $this->helpGetUser();

        $data = $this->helpSendQuery($user, false);

        $this->assertEmpty($data);

        $emailWasVerified = $this->helpCheckIfEmailWasVerified($user);

        $this->assertFalse($emailWasVerified);
    }

    function testVerifyingOnceRemovesDotBeforeEmail() {

        $user = $this->helpGetUser(true);

        $data = $this->helpSendQuery($user);

        $this->assertNotNull($data); // subject to change

        $emailWasVerified = $this->helpCheckIfEmailWasVerified($user);

        $this->assertTrue($emailWasVerified);
    }

    function testVerifyingTwiceDoesNothing() {

        $user = $this->helpGetUser();

        $this->helpSendQuery($user);

        $emailWasVerified = $this->helpCheckIfEmailWasVerified($user);
        $this->assertTrue($emailWasVerified);

        $this->helpSendQuery($user);

        $emailWasVerified = $this->helpCheckIfEmailWasVerified($user);
        $this->assertTrue($emailWasVerified);
    }
}
?>