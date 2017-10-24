<?php


require_once __DIR__ . '/../../../vendor/autoload.php';

use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;
use Youshido\GraphQL\Config\Field\FieldConfig;

use Youshido\GraphQL\Type\Object\AbstractObjectType;
use Youshido\GraphQL\Type\Scalar\StringType;
use Youshido\GraphQL\Type\NonNullType;

class TagType extends AbstractObjectType {

    public function build($config) {

        $config
            ->addField('tag', new NonNullType(new StringType()));
    }
}
