<?php


require_once __DIR__ . '/../../../vendor/autoload.php';

use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;
use Youshido\GraphQL\Config\Field\FieldConfig;

use Youshido\GraphQL\Type\Object\AbstractObjectType;
use Youshido\GraphQL\Type\ListType\ListType;
use Youshido\GraphQL\Type\NonNullType;
use Youshido\GraphQL\Type\Scalar\IdType;

class UpdateArticleType extends AbstractObjectType {

    public function build($config) {

        $config
            ->addFields([
                'id' => new NonNullType(new IdType()),
                'tags' => new ListType(new StringType()),
                'displayOrder' => new IntType(),
                'article' => new StringType()
            ]);
    }
}