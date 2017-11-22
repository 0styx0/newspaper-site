<?php


require_once __DIR__ . '/../../../../vendor/autoload.php';
require_once(__DIR__ . '/../../types/article.php');

use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;
use Youshido\GraphQL\Config\Field\FieldConfig;

use Youshido\GraphQL\Type\InputObject\AbstractInputObjectType;
use Youshido\GraphQL\Type\Scalar\StringType;
use Youshido\GraphQL\Type\Scalar\IdType;
use Youshido\GraphQL\Type\NonNullType;

class EditArticleField extends AbstractField {

    public function build(FieldConfig $config) {

        $config->addArguments([
            'article' => new NonNullType(new StringType()),
            'id' => new NonNullType(new IdType())
        ]);
    }

    public function getType() {
        return new NonNullType(new ArticleType());
    }

    public function resolve($root, array $args, ResolveInfo $info) {

        Guard::userMustBeLoggedIn();

        $articleInfo = Db::query("SELECT authorid, issue, id FROM pageinfo WHERE id = ?", [$args['id']])->fetchAll(PDO::FETCH_ASSOC)[0];
        $maxIssueInfo = Db::query("SELECT num, ispublic FROM issues ORDER BY num DESC LIMIT 1")->fetchAll(PDO::FETCH_ASSOC)[0];

        $articleIsPrivate = $maxIssueInfo['num'] == $articleInfo['issue'] && !$maxIssueInfo['ispublic'];

        if ($articleInfo['authorid'] !== Jwt::getField('id') || !$articleIsPrivate) {
            Guard::userMustBeLevel(3);
        }

        $ArticleHelper = new ArticleHelper();

        $safeArticle = $ArticleHelper->stripTags($args['article']);

        list($lede, $body, $images) = $ArticleHelper->breakDownArticle($safeArticle);
        Db::query("UPDATE pageinfo SET lede = ?, body = ? WHERE id = ?", [$lede, $body, $articleInfo['id']]);

        Db::query("DELETE FROM images WHERE art_id = ?", [$articleInfo['id']]);
        $ArticleHelper->addImages($articleInfo['id'], $images);

        return (new ArticlesField())->getArticles(['id' => $articleInfo['id']])[0];
    }
}

?>