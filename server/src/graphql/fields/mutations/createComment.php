<?php


require_once __DIR__ . '/../../../../vendor/autoload.php';
require_once(__DIR__ . '/../../types/comment.php');

use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;
use Youshido\GraphQL\Config\Field\FieldConfig;

use Youshido\GraphQL\Type\Object\AbstractObjectType;
use Youshido\GraphQL\Type\Scalar\StringType;
use Youshido\GraphQL\Type\Scalar\IdType;
use Youshido\GraphQL\Type\NonNullType;

class CreateCommentField extends AbstractField {

    public function build(FieldConfig $config) {

        $config->addArguments([
            'artId' => new NonNullType(new IdType()),
            'content' => new NonNullType(new StringType())
        ]);
    }

    public function getType() {
        return new CommentType();
    }

    public function resolve($root, array $args, ResolveInfo $info) {

        Guard::userMustBeLoggedIn();

        $sanitizedContent = $this->stripDangerousTags($args['content']);
        $sanitized = filter_var_array($args, FILTER_SANITIZE_STRING);

        Db::query("INSERT INTO comments (art_id, content, authorid) VALUES(?, ?, ?)",
          [$sanitized['artId'], $sanitizedContent, Jwt::getToken()->getClaim('id') ]);


        return array_merge($sanitized, ['content' => $sanitizedContent, 'id' => Db::$lastInsertId]);
    }

    private function stripDangerousTags(string $toStrip) {

        $config = HTMLPurifier_Config::createDefault();
        $purifier = new HTMLPurifier($config);
        $toStrip = $purifier->purify($toStrip);
        return strip_tags($toStrip, "<code><pre><p><a><strong><b><em><i><u><sub><sup><strike><ul><ol><li><q><blockquote><br><abbr>");
    }
}

?>