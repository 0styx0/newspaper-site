<?php

require_once __DIR__ . '/../../../../vendor/autoload.php';



require_once(__DIR__ . '/../../types/issue.php');


use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;
use Youshido\GraphQL\Config\Field\FieldConfig;
use Youshido\GraphQL\Type\Object\AbstractObjectType;
use Youshido\GraphQL\Type\Scalar\IdType;
use Youshido\GraphQL\Type\Scalar\IntType;
use Youshido\GraphQL\Type\Scalar\BooleanType;
use Youshido\GraphQL\Type\ListType\ListType;

class IssuesField extends AbstractField {

    public function build(FieldConfig $config) {

        $config->addArguments([
            'num' => new IdType(),
            'public' => new BooleanType(),
            'limit' => new IntType()
        ]);
    }

    public function getType() {
        return new ListType(new IssueType());
    }

    public function resolve($root, array $args, ResolveInfo $info) {

        $sanitized = filter_var($args, FILTER_SANITIZE_STRING);

        $where = Db::setPlaceholders($args);

        return Db::query("SELECT num, name, ispublic AS public, madepub AS datePublished,
           (SELECT SUM(views) FROM pageinfo WHERE issue = num) AS views
          FROM issues
          WHERE {$where}", $args)->fetchAll(PDO::FETCH_ASSOC);
    }
}

?>