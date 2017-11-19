<?php


require_once __DIR__ . '/../../../../vendor/autoload.php';
require_once(__DIR__ . '/../../types/article.php');

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

class CreateArticleField extends AbstractField {

    public function build(FieldConfig $config) {

        $config->addArguments([
            'tags' => new NonNullType(new ListType(new StringType())),
            'url' => new NonNullType(new StringType()),
            'article' => new NonNullType(new StringType())
        ]);
    }

    public function getType() {
        return new NonNullType(new ArticleType());
    }

    public function resolve($root, array $args, ResolveInfo $info) {

        Guard::userMustBeLoggedIn();

        $sanitized = filter_var_array($args, FILTER_SANITIZE_STRING);

        if (count($sanitized['tags']) < 1) {
            throw new Exception('Must have at least 1 tag');
        }

        if (strlen($sanitized['url']) < $_ENV['URL_LENGTH']) {
            throw new Exception('Url must be 6 or more characters');
        }

        $modifiedUrl = str_replace(' ', '-', $sanitized['url']); // spaces in url are now deprecated

        $ArticleHelper = new ArticleHelper();
        $safeArticle = $ArticleHelper->stripTags($args['article']);

        if (!strpos($safeArticle, '<p>') || !preg_match("/^<h1>([\s\S]+)<\/h1>[\s\S]*<h4>.+/", $safeArticle)) {
            throw new Exception('Articles must have heading, author, and at least 1 paragraph');
        }

        list($lede, $body, $imageInfo) = $ArticleHelper->breakDownArticle($safeArticle);

        $issue = $this->getPrivateIssue();

        Db::query("INSERT INTO pageinfo (lede, body, issue, authorid, url, created) VALUES(?, ?, ?, ?, ?, CURDATE())",
         [$lede, $body, $issue, Jwt::getToken()->getClaim('id'), $modifiedUrl]);

        $articleId = Db::query("SELECT id FROM pageinfo WHERE issue = ? and url = ?", [$issue, $modifiedUrl])->fetchColumn();

        if ($imageInfo) {
            $ArticleHelper->addImages($articleId, $imageInfo);
        }

        $ArticleHelper->addTags($articleId, $sanitized['tags']);

        return [
            'url' => $modifiedUrl,
            'issue' => +$issue
        ];
    }

    /**
     * @return max private issue, and if there is none, creates one
     */
    private function getPrivateIssue() {

        $maxIssue;
        $maxIssueInfo = Db::query("SELECT num, ispublic FROM issues ORDER BY num DESC LIMIT 1")->fetchAll(PDO::FETCH_ASSOC)[0];

        if ($maxIssueInfo['ispublic']) {

            $maxIssue = $maxIssueInfo['num'] + 1;
            Db::query("INSERT INTO issues (num) VALUES(?)", [$maxIssue]);
        } else {
            $maxIssue = $maxIssueInfo['num'];
        }

        return $maxIssue;
    }

}

?>