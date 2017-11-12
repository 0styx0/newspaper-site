<?php


require_once __DIR__ . '/../../../../vendor/autoload.php';
require_once(__DIR__ . '/../../types/user.php');

use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;
use Youshido\GraphQL\Config\Field\FieldConfig;

use Youshido\GraphQL\Type\Object\AbstractObjectType;
use Youshido\GraphQL\Type\Scalar\StringType;
use Youshido\GraphQL\Type\Scalar\IdType;
use Youshido\GraphQL\Type\Scalar\IntType;
use Youshido\GraphQL\Type\Scalar\BooleanType;
use Youshido\GraphQL\Type\NonNullType;

class CreateUserField extends AbstractField {

    public function build(FieldConfig $config) {

        $config->addArguments([
            'username' => new NonNullType(new StringType()),
            'email' => new NonNullType(new StringType()),
            'password' => new NonNullType(new StringType()),
            'level' => new IntType(),
            'firstName' => new NonNullType(new StringType()),
            'middleName' => new StringType(),
            'lastName' => new NonNullType(new StringType())
        ]);
    }

    public function getType() {
        return new UserType();
    }

    public function resolve($root, array $args, ResolveInfo $info) {

        Validate::email($args['email']);
        Validate::password($args['password']);

        $args['level'] = isset($args['level']) ? $args['level'] : 1;
        $args['level'] = Validate::level($args['level']);

        $sanitized = filter_var_array($args, FILTER_SANITIZE_STRING);

        $unverifiedEmail = '.' . $sanitized['email'];
        $authCode = bin2hex(random_bytes(8));

        $params = [
            $sanitized['username'],
            $unverifiedEmail,
            password_hash($args['password'], PASSWORD_DEFAULT),
            $sanitized['level'],
            $sanitized['firstName'],
            isset($sanitized['middleName']) ? $sanitized['middleName'] : null,
            $sanitized['lastName'],
            $authCode
        ];

        Db::query("INSERT INTO users (username, email, password, level, f_name, m_name, l_name, auth)
          VALUES(?, ?, ?, ?, ?, ?, ?, ?)", $params);

        SendMail::emailVerification($sanitized['email'], $authCode);

        unset($sanitized['password']);

        return array_merge($sanitized, ['id' => Db::$lastInsertId, 'level' => +$params[3]]);
    }
}

?>