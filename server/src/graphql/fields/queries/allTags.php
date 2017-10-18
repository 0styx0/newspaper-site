<?php

require_once __DIR__ . '/../../../../vendor/autoload.php';

use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;
use Youshido\GraphQL\Config\Field\FieldConfig;
use Youshido\GraphQL\Type\Object\AbstractObjectType;
use Youshido\GraphQL\Type\Scalar\StringType;
use Youshido\GraphQL\Type\Scalar\IdType;
use Youshido\GraphQL\Type\ListType\ListType;


class UsersField extends AbstractField {

    public function getType() {
        return new ListType(new StringType());
    }

    public function resolve($root, array $args, ResolveInfo $info) {

        $tagQuery = Db::query("SELECT tag FROM tag_list");
        return $tagList->fetchAll(PDO::FETCH_COLUMN, 0);
    }
}

?>