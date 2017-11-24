<?php

require_once __DIR__ . '/../../../vendor/autoload.php';
require_once(__DIR__ . '/article.php');
require_once(__DIR__ . '/../fields/queries/articles.php');

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
            'level' => [
                'type' => new IntType(),
                'resolve' => function($user) {
                    return +$user['level'];
                }
            ],
            'notifications' => [
                'type' => new BooleanType(),
                'resolve' => function ($user) {

                    if ($user['id'] !== Jwt::getField('id')) {
                        return null;
                    }
                    return !!$user['notifications'];
                }
            ],
            'twoFactor' => [
                'type' => new BooleanType(),
                'resolve' => function ($user) {

                    if ($user['id'] !== Jwt::getField('id')) {
                        return null;
                    }
                    return !!$user['twoFactor'];
                }
            ],
            'views' => [
                'type' => new NonNullType(new IntType()),
                'resolve' => function (array $user) {
                    return +$user['views'];
                }
            ],
            'articleCount' => [
                'type' => new NonNullType(new IntType()),
                'resolve' => function (array $user) {

                    try {
                        Guard::userMustBeLoggedIn();

                        return +Db::query("SELECT COUNT(id) FROM pageinfo WHERE authorid = ?", [$user['id']])->fetchColumn();
                    } catch(Exception $e) {

                        return +Db::query("SELECT COUNT(id) FROM pageinfo
                            JOIN issues ON num = issue
                            WHERE authorid = ? AND ispublic = 1", [$user['id']])->fetchColumn();
                    }
                }
            ],
            'profileLink' => [
                'type' => new NonNullType(new StringType()),
                'resolve' => function($user) {
                    return explode('@', $user['email'])[0];
                }
            ],
            'articles' => [
                'type' => new NonNullType(new ListType(new ArticleType())),
                'resolve' => function ($user) {

                    $ArticlesField = new ArticlesField();
                    return $ArticlesField->getArticles(['authorid' => $user['id']]);
                }
            ],
            'canEdit' => [
                'type' => new NonNullType(new BooleanType()),
                'resolve' => function ($user) {

                    return !!(Guard::userIsLoggedIn() &&
                        (Jwt::getField('id') == $user['id'] || Jwt::getField('level') > $user['level']));
                }
            ]
        ]);
    }
}
