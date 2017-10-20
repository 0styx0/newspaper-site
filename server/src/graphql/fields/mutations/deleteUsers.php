<?php


require_once __DIR__ . '/../../../../vendor/autoload.php';
require_once(__DIR__ . '/../../types/idList.php');

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

class DeleteUsersField extends AbstractField {

    public function build(FieldConfig $config) {

        $config->addArguments([
            'password' => new NonNullType(new StringType()),
            'ids' => new NonNullType(new ListType(new idType()))
        ]);
    }

    public function getType() {
        return new IdListType();
    }

    public function resolve($root, array $args, ResolveInfo $info) {

        $sanitized = filter_var_array($args, FILTER_SANITIZE_STRING);

        Guard::userMustBeLoggedIn();
        Guard::withPassword($args['password']);
        $this->ensureLevelIsGreaterThanAllTryingToDelete($sanitized['ids']);

        $placeholders = Db::generatePlaceholders($sanitized['ids']);

        // ensures Deleted User exists
        Db::query("INSERT INTO users (username, level, f_name, l_name)
                   VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE username = username",
                   ['deleted', 3, 'Deleted', 'User']);

        $convertOwnershipParams = array_merge(['deleted'], $sanitized['ids']);

        Db::query("UPDATE pageinfo SET authorid = (SELECT id FROM users WHERE username = ?) WHERE authorid IN ({$placeholders})", $convertOwnershipParams);
        Db::query("UPDATE comments SET authorid = (SELECT id FROM users WHERE username = ?) WHERE authorid IN ({$placeholders})", $convertOwnershipParams);
        Db::query("DELETE FROM users WHERE id IN ({$placeholders})", $sanitized['ids']);

        return ['id' => $sanitized['ids']];
    }

    /**
     *
     * @param $ids - ids which are attempting to delete
     *
     * @throws Exception if tryng to delete users of equal or higher level
     * than self, unless deleting own account
     */
    private function ensureLevelIsGreaterThanAllTryingToDelete(array $ids) {

        // can delete self regardless of level
        if (Jwt::getToken()->getClaim('id') === $ids[0] && count($ids) === 1) {
            return true;
        }

        $placeholders = Db::generatePlaceholders($ids);

        $maxUserLevel = Db::query("SELECT MAX(level) FROM users WHERE id IN ({$placeholders})", $ids)->fetchColumn();

        Guard::userMustBeLevel($maxUserLevel + 1);
    }
}

?>