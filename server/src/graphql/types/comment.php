<?php

require_once __DIR__ . '/../../../vendor/autoload.php';
require_once(__DIR__ . '/user.php');
require_once(__DIR__ . '/../fields/queries/users.php');


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

                    return (new UsersField())->getUsers(['id' => $comment['authorId']])[0];
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
