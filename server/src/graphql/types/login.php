<?php


require_once __DIR__ . '/../../../vendor/autoload.php';

use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;
use Youshido\GraphQL\Config\Field\FieldConfig;

use Youshido\GraphQL\Type\Object\AbstractObjectType;
use Youshido\GraphQL\Type\Scalar\StringType;
use Youshido\GraphQL\Type\NonNullType;

use Lcobucci\JWT\Builder;
use Lcobucci\JWT\Signer\Hmac\Sha256;


class LoginType extends AbstractObjectType {

    public function build($config) {

        $config
            ->addField('jwt', new StringType());
    }
}
