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


        $sanitized = $this->convertArgsToSqlParamNames($sanitized);
        $sanitized = $this->restrictAccessToPrivateIssues($sanitized, $maxIssue);
        list($sanitized, $limit) = $this->addLimitClause($sanitized);
        $where = Db::setPlaceholders($sanitized);
        $where = (!!trim($where) ? '' : ' :admin ') . $where;

        $sanitized['admin'] = Jwt::getField('level') > 2;

        return Db::query("SELECT num, name, ispublic AS public, madepub AS datePublished,
           (SELECT SUM(views) FROM pageinfo WHERE issue = num) AS views, (:admin AND ispublic != 1) canEdit
          FROM issues
          WHERE {$where} {$limit}", $sanitized)->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Switches graphql params to their mysql names, adds LIMIT to $where if applicable
     */
    private function convertArgsToSqlParamNames(array $sanitized) {

        if (isset($sanitized['public'])) {
            $sanitized['ispublic'] = $sanitized['public'];
            unset($sanitized['public']);
        }

        return $sanitized;
    }

    private function addLimitClause(array $sanitized) {

        if (isset($sanitized['limit'])) {
            $limit = " LIMIT {$sanitized['limit']} ";
            unset($sanitized['limit']);
        } else {
            $limit = '';
        }

        return [$sanitized, $limit];
    }

    private function restrictAccessToPrivateIssues(array $sanitized, array $maxIssue) {

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
                $sanitized['ispublic'] = 1;
            }
        }

        return $sanitized;
    }
}

?>