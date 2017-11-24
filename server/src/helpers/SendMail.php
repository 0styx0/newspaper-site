<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../../vendor/autoload.php';

class SendMail {

    /**
      * Given proper parameters, this emails a user
      *
      * @param $email - valid email address (lowercase.lowercase@tabc.org OR lettersnnnn@tabc.org where n is a digit)
      * @param $subject - string that will be sent at email subject
      * @param $message - string, will be sent as email body
      *
      * @return true if successful, else false
      */
    public static function specific(string $email, string $subject, string $message) {
        return SendMail::phpMail($email, $subject, $message);
    }

    /**
      * Sends an email notifying level 3 users that an article has been published
      *
      * @param $tags - string should consist of tags the article can be found under
      * @param $issueNum - name of issue article has been pubished in
      * @param $name - name of article
      *
      * @return true if sent, else false
      */
    public static function articlePublished(string $tags, int $issueNum, string $name) {

        $subject = "An article has been published";

        $message = "A user
            has published a {$tags} article for issue {$issueNum} called
            <a href='https://tabceots.com/issue/{$issueNum}/story/{$name}'>".rawurldecode($name) . "</a>
            <br />
            View details <a href='https://tabceots.com/modifyArticles'>here</a>";

        return SendMail::toLevel(3, $subject, $message);
    }

    /**
      * Sends an email to all users of level specified
      *
      * @param $lvl - int 1-3 (inclusive), email will be sent to users of this level
      * @param $subject - email subject
      * @param $message - email body
      *
      * @return true if sent, else false
      */
    public static function toLevel(int $lvl, string $subject = "", string $message = "") {

        $filteredLvl = filter_var($lvl, FILTER_SANITIZE_NUMBER_INT);

        $toEmail = Db::query("SELECT DISTINCT EMAIL FROM USERS WHERE LEVEL = ? AND SUBSTRING(EMAIL, 0, 1) != ? AND NOTIFICATIONS = 1", [$filteredLvl, "."]);

        return SendMail::phpMail($toEmail->fetchAll(PDO::FETCH_COLUMN, 0), $subject, $message);
    }

    /**
      * Sends email to user that gives them code when logging in with 2fa enabled
      *
      * @param $email - email address of user
      * @param $emailVerifyCode - code that will be sent. Must be unencrypted for obvious reasons
      *
      * @return true if email sent, else false
      */
    public static function twoFactor(string $email, string $emailVerifyCode) {

        $message = "Your code is <br />" . $emailVerifyCode . "<br/>This code is valid for 10 minutes.";

        return SendMail::phpMail([$email], "Auth code for Eye Of The Storm", $message);
    }

    /**
      * Sends email user gets either right after signing up, or after changing email
      *
      * @param $email - email address of user
      * @param $username - username of user
      * @param $code - decrypted version of auth code
      *
      * @return true if sent, else false
      */
    public static function emailVerification(string $email, string $code) {

        $message = "Your code is <br />{$code}<br/>This code is valid for 1 day.
                    Your account may be deleted if this is not
                    <a href='https://tabceots.com/login}'>verified</a>.";

        return SendMail::phpMail([$email], "Verify Your EOTS Account", $message);
    }

    /**
      * Sends email when users forgets password. Contains new password
      *
      * @param $newPassword - new, unencrypted password of user
      * @param $email - email address of user
      *
      * @return true if sent, else false
      */
    public static function passwordRecovery(string $newPassword, string $email) {

        $profileLink = explode('@', $email)[0];

        $message = "Your new password is <br />".
                      $newPassword
                      ."<br /> You are strongly advised to <a href='https://tabceots.com/u/{$profileLink}'>change</a>
                      it as soon as possible.
                      <br />To prevent passwords from being forgotten, consider using a password manager such as
                      1Password or LastPass";

        return SendMail::phpMail([$email], "Recovery Code for Eye Of The Storm", $message);
    }

    /**
      * Actually sends emails. Uses phpmailer library to do so
      *
      * @param $to - 1 or more valid email addresses (if 1, string, else array of strings)
      * @param $subject - subject of email
      * @param $message - email body
      *
      * @return true if all emails to $to have been sent, else false
      */
    private static function phpMail(array $to, string $subject, string $message) {

        if (Jwt::hasClaim('test') && Jwt::getField('test')) {
            return true;
        }

        $mail = new PHPMailer();

        if ($_ENV['EMAIL_HOST'] == "smtp.gmail.com") {
            $mail->IsSMTP();                           // telling the class to use SMTP
            // $mail->SMTPDebug = 2;
        }

        $mail->SMTPAuth   = true;                  // enable SMTP authentication
        $mail->SMTPSecure = 'tls';
        $mail->Host       = $_ENV['EMAIL_HOST'];          // set the SMTP server
        $mail->Port       = $_ENV['EMAIL_PORT'];                    // set the SMTP port
        $mail->Username   = $_ENV['EMAIL_ADDR']; // SMTP account username
        $mail->Password   = $_ENV['EMAIL_PASS'];
        $mail->From = $_ENV['EMAIL_ADDR'];
        $mail->FromName = $_ENV['EMAIL_NAME'];

        foreach ($to as $individual) {

            if (!filter_var($individual, FILTER_VALIDATE_EMAIL)) {

                return false;
            }

            $mail->addAddress($individual);
        }

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $message;

        if (!$mail->send() && count($to) > 0)  {
            return false;
        }

        return true;
    }
}
?>