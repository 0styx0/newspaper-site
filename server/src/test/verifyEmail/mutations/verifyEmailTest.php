<?php

require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class VerifyTest extends VerifyEmailTest {

    protected function helpSendQuery(array $user) {

        return $this->request([
            'query' => 'mutation verifyEmail($authCode: String!) {
                            verifyEmail(authCode: $authCode) {
                                jwt
                            }
                        }',
            'variables' => [
                'authCode' => $user['authCode']
            ]
        ], HelpTest::getJwt($user));
    }

    /**
     *
     * @param $emailIsVerified - bool if should get user with a verified email or not
     *
     * @return user 
     */
    protected function helpGetUser(bool $emailIsVerified = false) {

        return HelpTest::searchArray($this->Database->GenerateRows->users, function (array $currentUser) {
            return $emailIsVerified ? $currentUser['email'][0] !== '.' : $currentUser['email'][0] == '.';
        });
    }

    protected function helpCheckIfEmailWasVerified(array $user) {

        $dbEmail = Db::query("SELECT email FROM users WHERE id = ?", [$user['id']])->fetchColumn();

        return $dbEmail == substr($user['email'], 1);
    }

    function testBadAuthCode() {

        $user = $this->helpGetUser(true);
        $user['auth_code'] = $user['dauth_code'] . HelpTests::faker()->randomWord();

        $data = $this->helpSendQuery($user);

        $this->assertNull($data); // subject to change

        $emailWasVerified = $this->helpCheckIfEmailWasVerified($user);

        $this->assertFalse($emailWasVerified);
    }

    function testVerifyingOnceRemovesDotBeforeEmail() {

        $user = $this->helpGetUser();

        $data = $this->helpSendQuery($user);

        $this->assertNotNull($data); // subject to change

        $emailWasVerified = $this->helpCheckIfEmailWasVerified($user);

        $this->assertTrue($emailWasVerified);
    }

    function testVerifyingTwiceDoesNothing() {

        $user = $this->helpGetUser();

        $this->helpSendQuery($user);
        $this->helpSendQuery($user);

        $emailWasVerified = $this->helpCheckIfEmailWasVerified($user);

        $this->assertTrue($emailWasVerified);
    }
}
?>