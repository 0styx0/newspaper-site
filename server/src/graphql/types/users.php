<?php

// namespace EyeStorm\Server\PostType;


require_once __DIR__ . '/../../../vendor/autoload.php';

use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;

use Youshido\GraphQL\Type\Object\AbstractObjectType;
use Youshido\GraphQL\Type\Scalar\StringType;
use Youshido\GraphQL\Type\Scalar\IdType;
use Youshido\GraphQL\Type\NonNullType;
use Youshido\GraphQL\Type\Scalar\IntType;
use Youshido\GraphQL\Type\Scalar\BooleanType;
use Youshido\GraphQL\Type\ListType\ListType;

class UsersType extends AbstractObjectType {

    public function build($config) {
        $config
            ->addField('id', new NonNullType(new IdType()))
            ->addField('username', new StringType())
            ->addField('firstName', new NonNullType(new StringType()))
            ->addField('middleName', new StringType())
            ->addField('lastName', new NonNullType(new StringType()))
            ->addField('fullName', new NonNullType(new StringType()))
            ->addField('email', new NonNullType(new StringType()))
            ->addField('level', new IntType())
            ->addField('notifications', new BooleanType())
            ->addField('twoFactor', new BooleanType())
            ->addField('views', new NonNullType(new IntType()))
            ->addField('articleCount', new NonNullType(new IntType()))
            ->addField('profileLink', new NonNullType(new StringType()))
            ->addField('articles', new NonNullType(new ListType(''))) // ArticleType
            ->addField('canEdit', new NonNullType(new BooleanType()));
    }

    public function getName() {
        return 'Users';
    }
}

class UsersField extends AbstractField {

    public function getType() {
        return new ListType(new UsersType());
    }

    public function resolve($value, array $args, ResolveInfo $info) {

        return Db::query('SELECT username, id FROM users')->fetchAll(PDO::FETCH_ASSOC);
    }
}

?>