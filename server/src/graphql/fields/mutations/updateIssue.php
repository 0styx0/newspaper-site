<?php


require_once __DIR__ . '/../../../../vendor/autoload.php';
require_once(__DIR__ . '/../../types/issue.php');

use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;
use Youshido\GraphQL\Config\Field\FieldConfig;

use Youshido\GraphQL\Type\Object\AbstractObjectType;
use Youshido\GraphQL\Type\Scalar\StringType;
use Youshido\GraphQL\Type\Scalar\IdType;
use Youshido\GraphQL\Type\Scalar\BooleanType;
use Youshido\GraphQL\Type\NonNullType;

class UpdateIssueField extends AbstractField {

    public function build(FieldConfig $config) {

        $config->addArguments([
            'name' => new StringType(),
            'public' => new BooleanType(),
            'password' => new NonNullType(new StringType())
        ]);
    }

    public function getType() {
        return new IssueType();
    }

    public function resolve($root, array $args, ResolveInfo $info) {

        Guard::userMustBeLevel(3);
        Guard::withPassword($args['password']);

        $sanitized = filter_var_array($args, FILTER_SANITIZE_STRING);

        $maxIssueNumber = Db::query("SELECT MAX(num) FROM issues")->fetchColumn();
        $issue = Db::query("SELECT name, ispublic FROM issues WHERE num = ?", [$maxIssueNumber])->fetchAll(PDO::FETCH_ASSOC)[0];

        if ($issue['ispublic']) {
            throw new Exception('Cannot change public issues');
        }

        $fieldsToUpdate = [];

        if (isset($args['public'])) {

            if (!$args['name'] && !$issue['name']) {
                throw new Error('Issue must have a name');
            }

            $fieldsToUpdate['ispublic'] = $sanitized['public'] ? 1 : 0;
        }

        if (isset($args['name'])) {
            $fieldsToUpdate['name'] = $sanitized['name'];
        }

        $fieldKeys = implode(' = ?,', array_keys($fieldsToUpdate)) . ' = ?';
        $fieldValues = array_values($fieldsToUpdate);

        Db::query("UPDATE issues SET {$fieldKeys} WHERE num = ?", array_merge($fieldValues, [$maxIssueNumber]));
        return $sanitized;
    }
}

?>