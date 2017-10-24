<?php


require_once __DIR__ . '/../../../../vendor/autoload.php';
require_once(__DIR__ . '/../../types/article.php');

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

class DeleteArticlesField extends AbstractField {

    public function build(FieldConfig $config) {

        $config->addArguments([
            'password' => new NonNullType(new StringType()),
            'ids' => new ListType(new IdType())
        ]);
    }

    public function getType() {
        return new NonNullType(new ListType(new ArticleType()));
    }

    public function resolve($root, array $args, ResolveInfo $info) {

        Guard::userMustBeLoggedIn();
        Guard::withPassword($args['password']);

        $sanitized = filter_var_array($args, FILTER_SANITIZE_STRING);

        $placeholders = Db::generatePlaceholders($sanitized['ids']);
        $authorIds = Db::query("SELECT DISTINCT authorid FROM pageinfo WHERE id IN ({$placeholders})", $sanitized['ids'])->fetchAll(PDO::FETCH_COLUMN, 0);


        $userIsAuthor = count($authorIds) === 1 && Jwt::getToken()->getClaim('id') === $authorIds[0];

        if (!$userIsAuthor) {
            Guard::userMustBeLevel(3);
        }

        // if I remember, might be better to have on delete cascade on pageinfo
        foreach (['comments', 'images', 'tags'] as $table) {

            Db::query("DELETE FROM {$table} WHERE art_id IN ({$placeholders})", $sanitized['ids']);
        }

        Db::query("DELETE FROM pageinfo WHERE id IN ({$placeholders})", $sanitized['ids']);

        return $sanitized['ids'];
    }
}

?>