<?php


require_once __DIR__ . '/../../../../vendor/autoload.php';
require_once(__DIR__ . '/../../types/mission.php');

use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;
use Youshido\GraphQL\Config\Field\FieldConfig;

use Youshido\GraphQL\Type\InputObject\AbstractInputObjectType;
use Youshido\GraphQL\Type\Scalar\StringType;
use Youshido\GraphQL\Type\Scalar\idType;
use Youshido\GraphQL\Type\ListType\ListType;
use Youshido\GraphQL\Type\Scalar\IntType;
use Youshido\GraphQL\Type\Scalar\BooleanType;
use Youshido\GraphQL\Type\NonNullType;
use Youshido\GraphQL\Type\InputType;

class EditMissionField extends AbstractField {

    public function build(FieldConfig $config) {

        $config->addArguments([
            'mission' => new NonNullType(new StringType())
        ]);
    }

    public function getType() {
        return new NonNullType(new MissionType());
    }

    public function resolve($root, array $args, ResolveInfo $info) {

        Guard::userMustBeLevel(3);

        $ArticleHelper = new ArticleHelper();
        $safeMission = $ArticleHelper->stripTags($args['mission']);

        file_put_contents(__DIR__ . '/../../../../public/missionView.html', $safeMission);

        return ['mission' => $safeMission];
    }
}

?>