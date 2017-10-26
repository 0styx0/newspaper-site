<?php


require_once __DIR__ . '/../../../../vendor/autoload.php';
require_once(__DIR__ . '/../../types/article.php');
require_once(__DIR__ . '/../../types/updateArticle.php');

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

class UpdateArticlesField extends AbstractField {

    public function build(FieldConfig $config) {

        $config->addArguments([
            'password' => new NonNullType(new StringType()),
            'data' => new ListType(new UpdateArticleType())
        ]);
    }

    public function getType() {
        return new NonNullType(new ListType(new ArticleType()));
    }

    public function resolve($root, array $args, ResolveInfo $info) {

        Guard::userMustBeLoggedIn();
        Guard::withPassword($args['password']);

        // convert from obj to arr since sanitizer removes objects
        /** @author https://stackoverflow.com/a/18106696/6140527 **/
        $args['data'] = json_decode(json_encode($args['data']), true);

        $sanitized = filter_var_array($args, FILTER_SANITIZE_STRING);
        $ArticleHelper = new ArticleHelper();

        $authorIds = $this->getAuthorIds($sanitized['data']);

        foreach ($sanitized['data'] as $i => $article) {

            if (Jwt::getToken()->getClaim('id') !== $authorIds[$i]) {
                Guard::userMustBeLevel(3);
            }

            if (!empty($article['tags'])) {
                $this->replaceTags($article['id'], $article['tags']);
            }

            if (!empty($article['article'])) {

                $safeArticle = $ArticleHelper->stripTags($args['data'][$i]['article']);

                list($lede, $body, $images) = $ArticleHelper->breakDownArticle($safeArticle);
                Db::query("UPDATE pageinfo SET lede = ?, body = ? WHERE id = ?", [$lede, $body, $article['id']]);

                Db::query("DELETE FROM images WHERE art_id = ?", [$article['id']]);
                $ArticleHelper->addImages($article['id'], $images);
            }

            return $args['data'];
        }
    }

    /**
     * @return max private issue, and if there is none, creates one
     */
    private function getPrivateIssue() {

        $maxIssue;
        $maxIssueInfo = Db::query("SELECT num, ispublic FROM issues ORDER BY num DESC LIMIT 1")->fetchAll(PDO::FETCH_ASSOC)[0];

        if ($maxIssueInfo['ispublic']) {

            $maxIssue = $maxIssue['num'] + 1;
            Db::query("INSERT INTO issues (num) VALUES(?)", [$maxIssue]);
        } else {
            $maxIssue = $maxIssueInfo['num'];
        }

        return $maxIssue;
    }

    /**
     * Replaces tags currently tied to an article with new ones
     *
     * @param $articleId - id of article whose tags should be replaces
     * @param $tags - string[] new tags
     */
    private function replaceTags(string $articleId, array $tags) {

        Db::query("DELETE FROM tags WHERE art_id = ?", [$articleId]);

        $ArticleHelper = new ArticleHelper();
        $ArticleHelper->addTags($articleId, $tags);
    }

    /**
     * Gets authorid of all articles passed
     *
     * @param $data - ['id' => id_of_article, anything_else_makes_no_difference][]
     *
     * @return array of authorids in the same order as ids were in $data
     */
    private function getAuthorIds(array $data) {

        $ids = array_column($data, 'id');
        $placeholders = Db::generatePlaceholders($ids);

        $authorIds = Db::query("SELECT authorid FROM pageinfo WHERE id IN ({$placeholders})", $ids)->fetchAll(PDO::FETCH_COLUMN, 0);

        return $authorIds;
    }

}

?>