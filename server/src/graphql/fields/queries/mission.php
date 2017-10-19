<?php

require_once __DIR__ . '/../../../../vendor/autoload.php';
require_once __DIR__ . '/../../types/mission.php';

use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;
use Youshido\GraphQL\Config\Field\FieldConfig;
use Youshido\GraphQL\Type\Object\AbstractObjectType;
use Youshido\GraphQL\Type\Scalar\StringType;
use Youshido\GraphQL\Type\Scalar\IdType;
use Youshido\GraphQL\Type\ListType\ListType;


class MissionField extends AbstractField {

    public function getType() {
        return new MissionType();
    }

    public function resolve($root, array $args, ResolveInfo $info) {

        return [
            'mission' => file_get_contents(__DIR__ . '/../../../../public/missionView.html'),
            'canEdit' => Jwt::getToken()->getClaim('level') > 2
        ];
    }
}

?>