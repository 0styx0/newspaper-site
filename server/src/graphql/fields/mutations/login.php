<?php


require_once __DIR__ . '/../../../../vendor/autoload.php';
require_once(__DIR__ . '/../../types/login.php');

use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;
use Youshido\GraphQL\Config\Field\FieldConfig;

use Youshido\GraphQL\Type\Object\AbstractObjectType;
use Youshido\GraphQL\Type\Scalar\StringType;
use Youshido\GraphQL\Type\NonNullType;

class LoginField extends AbstractField {

    public function build(FieldConfig $config) {

        $config->addArguments([
            'username' => new NonNullType(new StringType()),
            'password' => new NonNullType(new StringType())
        ]);

    }

    public function getType() {
        return new LoginType();
    }

    /**
     * Generates json web token
     *
     * @return jwt string
     */
    public function resolve($root, array $args, ResolveInfo $info) {

        $user = Db::query("SELECT id, level, password, TRIM(TRAILING ? FROM email) AS profileLink, email
          FROM users
          WHERE username = ? OR email = ? OR email = CONCAT('.', ?)
          LIMIT 1",
          [$_ENV['USER_EMAIL_HOST'], $args['username'], $args['username'], $args['username']])->fetchAll(PDO::FETCH_ASSOC)[0];

        if (!password_verify($args['password'], $user['password'])) {
            throw new Error('Invalid Password');
        }

        $token = Jwt::setToken($user);

        $emailIsVerified = $user['email'][0] === '.';
        if (!$emailIsVerified) {
            $this->sendEmailVerification($user['id'], substr($user['email'], 1));
        }

        return ['jwt' => $token];
    }

    private function sendEmailVerification(string $id, string $email) {

            $fifteenMinutesFromNow = date('Y-m-d H:i:s', strtotime("+15 minutes"));
            $authCode = bin2hex(random_bytes(7));

            Db::query("UPDATE users SET auth_time = ?, auth = ? WHERE id = ?",
              [$fifteenMinutesFromNow, $authCode, $id]);

            SendMail::emailVerification($email, $authCode);
    }
}

?>