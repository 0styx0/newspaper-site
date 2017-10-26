<?php


require_once __DIR__ . '/../../../../vendor/autoload.php';
require_once(__DIR__ . '/../../types/passwordRecovery.php');

use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;
use Youshido\GraphQL\Config\Field\FieldConfig;

use Youshido\GraphQL\Type\InputObject\AbstractInputObjectType;
use Youshido\GraphQL\Type\Scalar\StringType;
use Youshido\GraphQL\Type\Scalar\IdType;
use Youshido\GraphQL\Type\ListType\ListType;
use Youshido\GraphQL\Type\Scalar\IntType;
use Youshido\GraphQL\Type\Scalar\BooleanType;
use Youshido\GraphQL\Type\NonNullType;
use Youshido\GraphQL\Type\InputType;

class RecoverPasswordField extends AbstractField {

    public function build(FieldConfig $config) {

        $config->addArguments([
            'authCode' => new NonNullType(new StringType()),
            'email' => new NonNullType(new StringType()),
            'username' => new NonNullType(new StringType())
        ]);
    }

    public function getType() {
        return new NonNullType(new PasswordRecoveryType());
    }

    public function resolve($root, array $args, ResolveInfo $info) {

        $sanitized = filter_var_array($args, FILTER_SANITIZE_STRING);

        $user = Db::query("SELECT id, auth FROM users WHERE username = ? AND email = ?",
          [$sanitized['username'], $sanitized['email']])->fetchAll(PDO::FETCH_ASSOC)[0];

        if (!empty($user) && password_verify($args['authCode'], $user['auth'])) {

            $newPassword = bin2hex(random_bytes(30));

            Db::query("UPDATE users SET password = ? WHERE id = ?",
              [password_hash($newPassword, PASSWORD_DEFAULT), $user['id']]);

            SendMail::passwordRecovery($newPassword, $sanitized['email']);

            return [
                'message' => 'Password has been changed. An email has been sent.'
            ];
        }

        throw new Exception('Invalid auth code');
    }
}

?>