<?php


require_once __DIR__ . '/../../../../vendor/autoload.php';
require_once(__DIR__ . '/../../types/login.php');

use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;
use Youshido\GraphQL\Config\Field\FieldConfig;

use Youshido\GraphQL\Type\Object\AbstractObjectType;
use Youshido\GraphQL\Type\Scalar\StringType;
use Youshido\GraphQL\Type\NonNullType;

use Lcobucci\JWT\Builder;
use Lcobucci\JWT\Signer\Hmac\Sha256;

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

        $signer = new Sha256();

        $user = Db::query("SELECT id, level, password, TRIM(TRAILING ? FROM email) AS profileLink
          FROM users
          WHERE username = ? OR email = ?
          LIMIT 1",
          [$_ENV['USER_EMAIL_HOST'], $args['username'], $args['username']])->fetchAll(PDO::FETCH_ASSOC)[0];

        if (!password_verify($args['password'], $user['password'])) {
            throw new Error('Invalid Password');
        }

        $token = (new Builder())->setIssuer('https://tabceots.com')
                                ->setAudience('https://tabceots.com')
                                ->setIssuedAt(time())
                                ->setExpiration(time() + 3600)
                                ->setId($user['id'], true)
                                ->set('id', $user['id'])
                                ->set('profileLink', $user['profileLink'])
                                ->set('level', $user['level'])
                                ->sign($signer, $_ENV['JWT_SECRET'])
                                ->getToken(); // Retrieves the generated token

        return ['jwt' => $token];
    }


}

?>