<?php

require_once __DIR__ . '/../../../../vendor/autoload.php';
require_once(__DIR__ . '/../../types/user.php');

use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;
use Youshido\GraphQL\Config\Field\FieldConfig;
use Youshido\GraphQL\Type\Object\AbstractObjectType;
use Youshido\GraphQL\Type\Scalar\StringType;
use Youshido\GraphQL\Type\Scalar\IdType;
use Youshido\GraphQL\Type\ListType\ListType;


class UsersField extends AbstractField {

    public function build(FieldConfig $config) {

        $config->addArguments([
            'id' => new IdType(),
            'profileLink' => new StringType()
        ]);
    }

    public function getType() {
        return new ListType(new UserType());
    }

    public function resolve($root, array $args, ResolveInfo $info) {

        $sanitized = filter_var_array($args, FILTER_SANITIZE_STRING);

        $where = Db::setArgs($args);

        if (isset($sanitized['profileLink'])) {

            $where = str_replace('profileLink = :profileLink', "email LIKE '{$sanitized['profileLink']}@%'", $where);

            $sanitized['email'] = $sanitized['profileLink'];
            unset($sanitized['profileLink']);
        }

        if (isset($sanitized['id'])) {
             $where = str_replace('id =', "users.id =", $where); // prevent ambigious column names
        }

        // basic fields, no authentication or filtering needed
        return Db::query("SELECT users.id AS id, f_name AS firstName, m_name AS middleName, l_name AS lastName,
          email, level, notifications, two_fa_enabled AS twoFactor, IFNULL(SUM(views), 0) AS views
          FROM users
          LEFT JOIN pageinfo ON authorid = users.id
          {$where}
          GROUP BY users.id",
          $sanitized)->fetchAll(PDO::FETCH_ASSOC);
    }
}

?>