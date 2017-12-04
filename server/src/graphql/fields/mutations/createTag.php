<?php


require_once __DIR__ . '/../../../../vendor/autoload.php';
require_once(__DIR__ . '/../../types/tag.php');

use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;
use Youshido\GraphQL\Config\Field\FieldConfig;

use Youshido\GraphQL\Type\InputObject\AbstractInputObjectType;
use Youshido\GraphQL\Type\Scalar\StringType;
use Youshido\GraphQL\Type\ListType\ListType;
use Youshido\GraphQL\Type\NonNullType;
use Youshido\GraphQL\Type\InputType;

class CreateTagField extends AbstractField {

    public function build(FieldConfig $config) {

        $config->addArguments([
            'tag' => new NonNullType(new StringType())
        ]);
    }

    public function getType() {
        return new NonNullType(new TagType());
    }

    public function resolve($root, array $args, ResolveInfo $info) {

        Guard::userMustBeLoggedIn();

        $ArticleHelper = new ArticleHelper();

        $sanitized = filter_var_array($args, FILTER_SANITIZE_STRING);

        if ($args['tag'] !== $sanitized['tag']) {
            throw new Exception('Invalid tag');
        }

        Db::query("INSERT INTO tag_list (tag) VALUES(?)", [strtolower($sanitized['tag'])]);

        return ['tag' => $sanitized['tag']];
    }
}

?>