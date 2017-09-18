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

class UserType extends AbstractObjectType {

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
}
