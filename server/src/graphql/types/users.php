<?php

require_once __DIR__ . '/../../../vendor/autoload.php';

use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;
use Youshido\GraphQL\Config\Field\FieldConfig;
use Youshido\GraphQL\Type\Object\AbstractObjectType;
use Youshido\GraphQL\Type\Scalar\StringType;
use Youshido\GraphQL\Type\Scalar\IdType;
use Youshido\GraphQL\Type\NonNullType;
use Youshido\GraphQL\Type\Scalar\IntType;
use Youshido\GraphQL\Type\Scalar\BooleanType;
use Youshido\GraphQL\Type\ListType\ListType;

class UsersType extends AbstractObjectType {

    public function build($config) {

        $config->addFields([
            'id' => new NonNullType(new IdType()),
            'username' => new StringType(),
            'firstName' => new NonNullType(new StringType()),
            'middleName' => new StringType(),
            'lastName' => new NonNullType(new StringType()),
            'fullName' => new NonNullType(new StringType()),
            'email' => new NonNullType(new StringType()),
            'level' => new IntType(),
            'notifications' => new BooleanType(),
            'twoFactor' => new BooleanType(),
            'views' => new NonNullType(new IntType()),
            'articleCount' => new NonNullType(new IntType()),
            'profileLink' => [
                'type' => new NonNullType(new StringType()),
                'resolve' => function($user) {
                    return explode('@', $user['email'])[0];
                }
            ],
            'articles' => new NonNullType(new ListType('')), // ArticleType
            'canEdit' => new NonNullType(new BooleanType())
        ]);
    }

    public function getName() {
        return 'Users';
    }
}

class UsersField extends AbstractField {

    public function build(FieldConfig $config) {

        $config->addArguments([
            'id' => new IdType(),
            'profileLink' => new StringType()
        ]);
    }

    public function getType() {
        return new ListType(new UsersType());
    }

    // TODO: deal with jwt
    public function resolve($root, array $args, ResolveInfo $info) {

        $sanitized = filter_var($args, FILTER_SANITIZE_STRING);

        $where = Db::setPlaceholders($args);


        // basic fields, no authentication or filtering needed
        return Db::query("SELECT id, f_name AS firstName, m_name AS middleName, l_name AS lastName,
          email, level FROM users WHERE {$where}", $args)->fetchAll(PDO::FETCH_ASSOC);
    }
}

?>