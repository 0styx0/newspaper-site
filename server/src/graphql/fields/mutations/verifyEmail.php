<?php


require_once __DIR__ . '/../../../../vendor/autoload.php';
require_once(__DIR__ . '/../../types/login.php');

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

class VerifyEmailField extends AbstractField {

    public function build(FieldConfig $config) {

        $config->addArguments([
            'authCode' => new NonNullType(new StringType())
        ]);
    }

    public function getType() {
        return new LoginType();
    }

    public function resolve($root, array $args, ResolveInfo $info) {

        if (!Jwt::getToken()) { // not using Guard since ONLY id should be in jwt, not level or profileLink etc
            throw new Exception('User must be logged in');
        }

        $sanitized = filter_var_array($args, FILTER_SANITIZE_STRING);

        $user = Db::query("SELECT auth_time, auth, level, id, TRIM(TRAILING ? FROM email) AS profileLink FROM users WHERE id = ?",
          [$_ENV['USER_EMAIL_HOST'], Jwt::getToken()->getClaim('id')])->fetchAll(PDO::FETCH_ASSOC)[0];

        if ($user['profileLink'][0] !== '.') {
            return ['jwt' => Jwt::setToken($user)];
        }

        $correctAuthInfo = password_verify($args['authCode'], $user['auth']) &&
          (strtotime($user['auth_time']) - time() > 0);

        if (!$correctAuthInfo) {
            throw new Exception('Incorrect auth code');
        }

        Db::query("UPDATE users SET email = TRIM(LEADING '.' FROM email) WHERE id = ?", [Jwt::getToken()->getClaim('id')]);

        $verifiedProfileLink = substr($user['profileLink'], 1);

        $jwt = Jwt::setToken(array_merge($user, ['profileLink' => $verifiedProfileLink]));

        return ['jwt' => $jwt];
    }
}

?>