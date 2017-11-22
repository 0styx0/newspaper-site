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

        if (strlen($args['content']) < 5) {
            throw new Exception('Comments must be longer than 5 characters');
        }

        $articleIsPublic = Db::query("SELECT ispublic FROM issues WHERE num = (SELECT issue FROM pageinfo WHERE id = ?)", [$sanitized['artId']])->fetchColumn();

        if (!$articleIsPublic) {
            throw new Exception('Cannot comment on private articles');
        }

        Db::query("INSERT INTO comments (art_id, content, authorid) VALUES(?, ?, ?)",
          [$sanitized['artId'], $sanitizedContent, Jwt::getField('id') ]);


        return array_merge($sanitized, ['content' => $sanitizedContent, 'id' => Db::$lastInsertId]);
    }

    private function stripDangerousTags(string $toStrip) {

        $config = HTMLPurifier_Config::createDefault();
        $config->set('URI.AllowedSchemes', ['http' => true,
                                            'https' => true,
                                            'mailto' => true
                                            ]);
        $config->set('CSS.AllowedProperties', 'href');
        $config->set('HTML.Allowed', 'div,code,pre,p,a[href],strong,b,em,i,u,sub,sup,strike,ul,ol,li,q,blockquote,br,abbr');
        $config->set('AutoFormat.RemoveEmpty', true); // remove empty tag pairs
        $config->set('AutoFormat.RemoveEmpty.RemoveNbsp', true); // remove empty, even if it contains an &nbsp;
        $config->set('AutoFormat.AutoParagraph', true); // remove empty tag pairs

        $purifier = new HTMLPurifier($config);
        $purified = $purifier->purify($toStrip);

        return $purified;
    }
}

?>