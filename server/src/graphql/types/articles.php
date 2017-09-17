<?php

require_once __DIR__ . '/../../../vendor/autoload.php';
require_once(__DIR__ . '/users.php');


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

class ArticlesType extends AbstractObjectType {

    public function build($config) {

        $config->addFields([
            'id' => new NonNullType(new IdType()),
            'dateCreated' => new TimestampType(),
            'lede' => new NonNullType(new StringType()),
            'body' => new StringType(),
            'url' => new NonNullType(new StringType()),
            'article' => [
                'type' => new NonNullType(new StringType()),
                'resolve' => function ($article) {
                    // TODO addView

                    $content = $article['lede'] . $article['body'];

                    $images = Db::Query("SELECT url FROM images WHERE art_id = ?", [$article['id']])->fetchAll(PDO::FETCH_COLUMN, 0);

                    foreach ($images as $image) {

                        if (strpos($content, 'data-src') !== false) {
                            $content = substr_replace($content, "src='${$img}'", $imagePos, strlen('data-src'));
                        }
                    }

                    return $content;
                }
            ],
            'issue' => new NonNullType(new IntType()),
            'views' => new NonNullType(new IntType()),
            'displayOrder' => new NonNullType(new IntType()),
            'tags' => [
                'type' => new NonNullType(new ListType(new StringType())),
                'resolve' => function ($article) {
                    return Db::Query("SELECT tag FROM tags WHERE art_id = ?", [$article['id']])->fetchAll(PDO::FETCH_COLUMN, 0);
                }
            ],
            'authorId' => new NonNullType(new IdType()),
            'author' => [
                'type' => new NonNullType(new UsersType()),
                'resolve' => function ($article) {

                    return Db::query("SELECT id, f_name AS firstName, m_name AS middleName, l_name AS lastName,
                        email, level FROM users WHERE id = ?", [$article['authorId']])->fetchAll(PDO::FETCH_ASSOC)[0];
                }
            ],
            'comments' => [
                'type' => new NonNullType(new ListType('')), // CommentType
                'resolve' => function ($article) {
                    return Db::Query("SELECT id, art_id, authorid, content, created AS dateCreated
                      FROM comments
                      WHERE art_id = ?", [$article['id']])->fetchAll(PDO::FETCH_ASSOC);
                }
            ],
            'images' => [
                'type' => new NonNullType(new ListType('')), // ImageType
                'args' => [
                    'slide' => new BooleanType()
                ],
                'resolve' => function ($article, $args) {

                    $sql = "SELECT id, slide, art_id, url FROM images WHERE art_id = ?";

                    if (isset($args['slide'])) {
                        return Db::Query("{$sql} AND slide = ?", [$article['id'], +$args['slide']])->fetchAll(PDO::FETCH_ASSOC);
                    }

                    return Db::Query($sql, [$article['id']])->fetchAll(PDO::FETCH_ASSOC);
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

class ArticlesField extends AbstractField {

    public function build(FieldConfig $config) {

        $config->addArguments([
            'id' => new IdType(),
            'authorid' => new IdType(),
            'artId' => new IdType(),
            'tag' => new StringType(),
            'issue' => new StringType(),
            'url' => new StringType(),
        ]);
    }

    public function getType() {
        return new ListType(new ArticlesType());
    }

    public function resolve($root, array $args, ResolveInfo $info) {

        if (empty($args)) {
            throw new Error('Gives most recent issue articles');
        }

        $sanitized = filter_var($args, FILTER_SANITIZE_STRING);

        $where = Db::setPlaceholders($args);

        // basic fields, no authentication or filtering needed
        return Db::query("SELECT id, created AS dateCreated, lede, body, url, issue,
          views, display_order AS displayOrder, authorId
          FROM pageinfo
          WHERE {$where}", $args)->fetchAll(PDO::FETCH_ASSOC);
    }
}

?>