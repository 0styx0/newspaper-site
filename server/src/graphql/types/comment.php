<?php

require_once __DIR__ . '/../../../vendor/autoload.php';
require_once(__DIR__ . '/user.php');


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

class CommentType extends AbstractObjectType {

    public function build($config) {

        $config->addFields([
            'id' => new NonNullType(new IdType()),
            'artId' => new NonNullType(new IdType()),
            'authorId' => new NonNullType(new IdType()),
            'content' => new NonNullType(new StringType()),
            'dateCreated' => new StringType(),
            'author' => [
                'type' => new UserType(),
                'resolve' => function ($comment) {

                    return Db::query("SELECT id, f_name AS firstName, m_name AS middleName, l_name AS lastName,
                        email, level FROM users WHERE id = ?", [$comment['authorId']])->fetchAll(PDO::FETCH_ASSOC)[0];
                }
            ],
            'canDelete' => [
                'type' => new NonNullType(new BooleanType()),
                'resolve' => function ($comment) {
                    return !!$comment['canDelete'];
                }
            ]
        ]);
    }
}
