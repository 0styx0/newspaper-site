<?php

require_once __DIR__ . '/../../../../vendor/autoload.php';
require_once(__DIR__ . '/../../types/article.php');


use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;
use Youshido\GraphQL\Config\Field\FieldConfig;
use Youshido\GraphQL\Type\Object\AbstractObjectType;
use Youshido\GraphQL\Type\Scalar\StringType;
use Youshido\GraphQL\Type\Scalar\IdType;
use Youshido\GraphQL\Type\ListType\ListType;


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
        return new ListType(new ArticleType());
    }

    public function resolve($root, array $args, ResolveInfo $info) {


        $sanitized = filter_var_array($args, FILTER_SANITIZE_STRING);

        $where = Db::setPlaceholders($args);

        if (empty($args)) {
            $where = 1;
        }

        // basic fields, no authentication or filtering needed
        return Db::query("SELECT id, created AS dateCreated, lede, body, url, issue,
          views, display_order AS displayOrder, authorId
          FROM pageinfo
          WHERE {$where}", $sanitized)->fetchAll(PDO::FETCH_ASSOC);
    }
}

?>