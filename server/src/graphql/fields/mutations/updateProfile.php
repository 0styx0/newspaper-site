<?php


require_once __DIR__ . '/../../../../vendor/autoload.php';
require_once(__DIR__ . '/../../types/idList.php');

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

class UpdateProfileField extends AbstractField {

    public function build(FieldConfig $config) {

        $config->addArguments([
            'notificationStatus' => new BooleanType(),
            'twoFactor' => new BooleanType(),
            'newPassword' => new StringType(),
            'password' => new NonNullType(new StringType())
        ]);
    }

    public function getType() {
        return new NonNullType(new UserType());
    }

    public function resolve($root, array $args, ResolveInfo $info) {

        $sanitized = filter_var_array($args, FILTER_SANITIZE_STRING);

        Guard::userMustBeLoggedIn();
        Guard::withPassword($args['password']);
        unset($sanitized['password']); // don't want to update password, unless we do, in which case newPassword is used

        $sqlParams = $this->mapArgsToDbCols($sanitized);
        $placeholderArr = [];

        foreach ($sqlParams as $key => $value) {
            $placeholders[] = "{$key} = ?";
        }

        $placeholderString = implode($placeholders, ',');
        $userId = Jwt::getToken()->getClaim('id');

        Db::query("UPDATE users SET {$placeholderString} WHERE id = ?",
          array_merge(array_values($sanitized), [$userId]));

        return ['id' => $userId];
    }

    /**
     * Converts keys of the graphql assoc array arguments to the db equivalent
     *
     * @param $args - the graphql argument array
     *
     * @return $args with keys switched to db field names, with newPassword, if provided, hashed
     */
    private function mapArgsToDbCols(array $args) {

        $fieldsToUpdate = [];

        $argsToDbMap = [
            'notificationStatus' => 'notifications',
            'twoFactor' => 'two_fa_enabled',
            'newPassword' => 'password'
        ];

        foreach ($argsToDbMap as $arg => $dbCol) {

            if (isset($args[$arg])) {

                $fieldsToUpdate[$dbCol] = $argsToDbMap[$arg];
            }
        }

        if (isset($fieldsToUpdate['password'])) {
            $fieldsToUpdate['password'] = password_hash($fieldsToUpdate['password'], PASSWORD_DEFAULT);
        }

        return $fieldsToUpdate;
    }
}

?>