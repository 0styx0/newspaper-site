<?php


require_once __DIR__ . '/../../../../vendor/autoload.php';
require_once(__DIR__ . '/../../types/user.php');

use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;
use Youshido\GraphQL\Config\Field\FieldConfig;

use Youshido\GraphQL\Type\InputObject\AbstractInputObjectType;
use Youshido\GraphQL\Type\Scalar\StringType;
use Youshido\GraphQL\Type\Scalar\IdType;
use Youshido\GraphQL\Type\ListType\ListType;
use Youshido\GraphQL\Type\Scalar\IntType;
use Youshido\GraphQL\Type\Scalar\BooleanType;
use Youshido\GraphQL\Type\NonNullType;
use Youshido\GraphQL\Type\InputType;

class IdLevelListType extends AbstractInputObjectType {

    public function build($config) {
        $config
            ->addField('ids', new NonNullType(new ListType(new IdType())))
            ->addField('level', new NonNullType(new IntType()));
    }
}

class UpdateUsersField extends AbstractField {

    public function build(FieldConfig $config) {

        $config->addArguments([
            'password' => new NonNullType(new StringType()),
            'data' => new NonNullType(new ListType(new IdLevelListType()))
        ]);
    }

    public function getType() {
        return new ListType(new UserType());
    }

    public function resolve($root, array $args, ResolveInfo $info) {

        Guard::userMustBeLevel(2);
        Guard::withPassword($args['password']);

        $result = [];

        foreach ($args['data'] as $level) {

            $placeholders = Db::generatePlaceholders($level['ids']);

            $maxUserLevel = Db::query("SELECT MAX(level) FROM users WHERE id IN ({$placeholders})", $level['ids'])->fetchColumn();

            $currentUserLevel = Jwt::getToken()->getClaim('level');

            if ($maxUserLevel >= $currentUserLevel || $currentUserLevel < $level['level']) {
                continue;
            }

            Db::query("UPDATE users SET level = ? WHERE id IN ({$placeholders})",
              array_merge([$level['level']], $level['ids']));

            foreach ($level['ids'] as $id) {
                array_push($result, ['level' => $level['level'], 'id' => $id]);
            }
        }

        return $result;
    }
}

?>