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

class DeleteCommentField extends AbstractField {

    public function build(FieldConfig $config) {

        $config->addArguments([
            'id' => new NonNullType(new IdType())
        ]);
    }

    public function getType() {
        return new CommentType();
    }

    /**
     * Checks if user is either level 3, or is deleting own comment
     *
     * @throws exceptions if user is not authorized
     */
    private function checkUserAuthorization(int $id) {

        try {
            Guard::userMustBeLevel(3);
        } catch (Exception $e) {

            $authorid = Db::query("SELECT authorid FROM comments WHERE id = ?", [$id])->fetchColumn();

            if ($authorid !== Jwt::getToken()->getClaim('id')) {
                throw new Error('Users can only delete their own comments');
            }
        }
    }

    public function resolve($root, array $args, ResolveInfo $info) {

        $sanitized = filter_var_array($args, FILTER_SANITIZE_STRING);

        $this->checkUserAuthorization($sanitized['id']);

        Db::query("DELETE FROM comments WHERE id = ?", [$sanitized['id']]);

        return $sanitized;
    }
}

?>