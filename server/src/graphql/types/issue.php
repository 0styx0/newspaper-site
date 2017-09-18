<?php

require_once __DIR__ . '/../../../vendor/autoload.php';
require_once(__DIR__ . '/article.php');


use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;
use Youshido\GraphQL\Config\Field\FieldConfig;
use Youshido\GraphQL\Type\Object\AbstractObjectType;
use Youshido\GraphQL\Type\Scalar\StringType;
use Youshido\GraphQL\Type\Scalar\IdType;
use Youshido\GraphQL\Type\NonNullType;
use Youshido\GraphQL\Type\Scalar\IntType;
use Youshido\GraphQL\Type\Scalar\TimestampType;
use Youshido\GraphQL\Type\Scalar\BooleanType;
use Youshido\GraphQL\Type\ListType\ListType;

class IssueType extends AbstractObjectType {

    public function build($config) {

        $config->addFields([
            'num' => new NonNullType(new IdType()),
            'name' => new NonNullType(new StringType()),
            'public' => new NonNullType(new BooleanType()),
            'datePublished' => new TimestampType(),
            'articles' => [
                'type' => new NonNullType(new ListType(new ArticlesType())),
                'resolve' => function ($issue) {

                    return Db::query("SELECT id, created AS dateCreated, lede, body, url, issue,
                        views, display_order AS displayOrder, authorId
                        FROM pageinfo
                        WHERE issue = ?", [$issue['num']])->fetchAll(PDO::FETCH_ASSOC);
                }
            ],
            'views' => new NonNullType(new IntType()),
            'max' => [
                'type' => new NonNullType(new IntType()),
                'resolve' => function ($issue) {

                    // TODO `false` should be userLoggedIn
                    return Db::Query("SELECT MAX(num) FROM issues WHERE public = ? OR ?", [1, false])->fetchColumn();
                }
            ],
            'canEdit' => [
                'type' => new NonNullType(new BooleanType()),
                'resolve' => function ($article) {
                    return false;
                }
            ]
        ]);
    }
}
