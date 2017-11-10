<?php

require_once __DIR__ . '/../../../../vendor/autoload.php';



require_once(__DIR__ . '/../../types/issue.php');


use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;
use Youshido\GraphQL\Config\Field\FieldConfig;
use Youshido\GraphQL\Type\Object\AbstractObjectType;
use Youshido\GraphQL\Type\Scalar\IdType;
use Youshido\GraphQL\Type\Scalar\IntType;
use Youshido\GraphQL\Type\Scalar\BooleanType;
use Youshido\GraphQL\Type\ListType\ListType;

class IssuesField extends AbstractField {

    public function build(FieldConfig $config) {

        $config->addArguments([
            'num' => new IdType(),
            'public' => new BooleanType(),
            'limit' => new IntType()
        ]);
    }

    public function getType() {
        return new ListType(new IssueType());
    }

    public function resolve($root, array $args, ResolveInfo $info) {

        $sanitized = filter_var_array($args, FILTER_SANITIZE_STRING);

        $where = '';

        if (isset($sanitized['limit'])) {
            $where .= " LIMIT {$sanitized['limit']} ";
            unset($sanitized['limit']);
        }
        if (isset($sanitized['public'])) {
            $sanitized['ispublic'] = $sanitized['public'];
            unset($sanitized['public']);
        }
        if (empty($sanitized)) {

            try {
                Guard::userMustBeLoggedIn();
            } catch (Exception $e) {
                $where = ' AND ispublic = :ispublic';
            }
        }


        $where = (count($sanitized) > 0 ? Db::setPlaceholders($sanitized) : 1) . $where;

        $maxIssue = Db::query("SELECT num, ispublic from issues ORDER BY num DESC LIMIT 1")->fetchAll(PDO::FETCH_ASSOC)[0];

        $issueRequestedDoesNotExist = !empty($sanitized['num']) && $sanitized['num'] > $maxIssue['num'];

        if ($issueRequestedDoesNotExist) {
            $sanitized['num'] = $maxIssue['num'];
        }

        $sanitized = $this->restrictAccessToPrivateIssues($sanitized, $maxIssue);

        return Db::query("SELECT num, name, ispublic AS public, madepub AS datePublished,
           (SELECT SUM(views) FROM pageinfo WHERE issue = num) AS views
          FROM issues
          WHERE {$where}", $sanitized)->fetchAll(PDO::FETCH_ASSOC);
    }

    private function restrictAccessToPrivateIssues(array $sanitized, array $maxIssue) {

        try {
            Guard::userMustBeLoggedIn();
        } catch (Exception $e) {

            $attemptingAccessToPrivateIssue = (
                isset($sanitized['num']) && $maxIssue['num'] == $sanitized['num'] &&
                $maxIssue['ispublic'] == 0
             ) ||
             (isset($sanitized['ispublic']) && !$sanitized['ispublic']);

            if (isset($sanitized['num']) && $attemptingAccessToPrivateIssue) {
                $sanitized['num']--;
            }
            if (empty($sanitized) || isset($sanitized['ispublic']) && $attemptingAccessToPrivateIssue) {
                $sanitized['ispublic'] = 1;
            }
        }

        return $sanitized;
    }
}

?>