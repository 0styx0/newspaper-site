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

        $maxIssue = Db::query("SELECT num, ispublic from issues ORDER BY num DESC LIMIT 1")->fetchAll(PDO::FETCH_ASSOC)[0];

        $issueRequestedDoesNotExist = isset($sanitized['num']) &&
          ($sanitized['num'] > $maxIssue['num'] || $sanitized['num'] == 0);

        if ($issueRequestedDoesNotExist) {
            $sanitized['num'] = $maxIssue['num'];
        }

        $where = Db::setPlaceholders($sanitized);
        list($sanitized, $where) = $this->convertArgsToSqlParamNames($sanitized, $where);
        list($sanitized, $where) = $this->restrictAccessToPrivateIssues($sanitized, $maxIssue, $where);

        $sanitized['admin'] = Jwt::getField('level') > 2;

        if (!$where) {
            $where = ':admin';
        }

        return Db::query("SELECT num, name, ispublic AS public, madepub AS datePublished,
           (SELECT SUM(views) FROM pageinfo WHERE issue = num) AS views, (:admin AND ispublic != 1) canEdit
          FROM issues
          WHERE {$where}", $sanitized)->fetchAll(PDO::FETCH_ASSOC);
    }

    private function convertArgsToSqlParamNames(array $sanitized, string $where) {

        if (isset($sanitized['public'])) {
            $sanitized['ispublic'] = $sanitized['public'];
            $where = str_replace('public', 'ispublic', $where);
            unset($sanitized['public']);
        }

        if (isset($sanitized['limit'])) {
            $where .= " LIMIT {$sanitized['limit']} ";
            $where = str_replace('AND limit = :limit', '', $where);
            $where = str_replace('limit = :limit', '', $where);
            unset($sanitized['limit']);
        }

        return [$sanitized, $where];
    }

    private function restrictAccessToPrivateIssues(array $sanitized, array $maxIssue, string $where) {

        if (!Guard::userIsLoggedIn() && $maxIssue['ispublic'] == 0) {

            $tryingToAccessPrivateNum = isset($sanitized['num']) && $maxIssue['num'] == $sanitized['num'];
            $tryingToAccessPrivateStatus = isset($sanitized['ispublic']) && !$sanitized['ispublic'];
            $onlyHaveLimitArg = (count($sanitized) === 1 && isset($sanitized['limit']));

            if ($tryingToAccessPrivateNum) {
                $sanitized['num']--;
            }

            if (empty($sanitized) ||
                $tryingToAccessPrivateStatus ||
                $onlyHaveLimitArg
               ) {

                $and = (empty($sanitized)) ? '' : 'AND';
                $sanitized['ispublic'] = 1;
                $where = " {$and} ispublic = :ispublic " . $where;
            }
        }

        return [$sanitized, $where];
    }
}

?>