<?php

require_once __DIR__ . '/../../vendor/autoload.php';

class Validate {

    /**
     * Checks if email is in valid format
     *
     * @param $email - email to check
     *
     * @throws Exception Invalid email if invalid format, or hostname isn't USER_EMAIL_HOST env variable
     */
    public static function email(string $email) {

        if (!filter_var($email, FILTER_VALIDATE_EMAIL) ||
          ($_ENV['USER_EMAIL_HOST'] !== '*' && explode('@', $email)[1] !== $_ENV['USER_EMAIL_HOST'])) {
              throw new Exception('Invalid email');
        }

        return true;
    }

    /**
     *
     * @param $password - to check
     *
     * @throws Exception if $password is less than 6 chars
     */
    public static function password(string $password) {

        if (strlen($password) < 6) {
            throw new Exception('Password must be at least 6 characters');
        }

        return true;
    }

    /**
     * @param $level - level to check
     *
     * @throws {Exception} when $level is not 1-3 or
     *  when user creating the account has a $level greater than the user trying to create
     *
     * @return $level (unmodified)
     */
    public static function level(int $level) {

        $userLevel = Jwt::getField('level') ? Jwt::getField('level') : 1;

        if ($userLevel < $level) {
            throw new Exception('Cannot have a level greater than the one signing you up');
        }

        if ($level > 3 || $level < 1) {
            throw new Exception('Level must be between 1 and 3 (inclusive)');
        }

        return $level ? $level : 1;
    }



}
?>