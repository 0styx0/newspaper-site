<?php

require_once __DIR__ . '/../../../../vendor/autoload.php';
require_once(__DIR__ . '/../../types/comment.php');


use Youshido\GraphQL\Execution\ResolveInfo;
use Youshido\GraphQL\Field\AbstractField;
use Youshido\GraphQL\Config\Field\FieldConfig;
use Youshido\GraphQL\Type\Object\AbstractObjectType;
use Youshido\GraphQL\Type\Scalar\IdType;
use Youshido\GraphQL\Type\ListType\ListType;


class CommentsField extends AbstractField {

    public function build(FieldConfig $config) {

        $config->addArguments([
            'id' => new IdType(),
            'authorid' => new IdType(),
            'artId' => new IdType()
        ]);
    }

    public function getType() {
        return new ListType(new CommentType());
    }

    public function resolve($root, array $args, ResolveInfo $info) {

        return $this->getComments($args);
    }

    public function getComments(array $args) { // separate than resolve so can call from types/article

        if (isset($args['artId'])) {
            $args['art_id'] = $args['artId'];
            unset($args['artId']);
        }
        if (isset($args['id'])) {
            $args['commentsId'] = $args['id'];
            unset($args['id']);
        }
        if (isset($args['authorid'])) {
            $args['authorId'] = $args['authorid'];
            unset($args['authorid']);
        }

        $sanitized = filter_var_array($args, FILTER_SANITIZE_STRING);

        $where = Db::setPlaceholders($sanitized);
        $where = str_replace('commentsId =', 'comments.id =', $where);
        $where = str_replace('authorId =', 'comments.authorid =', $where);

        $result = Db::query("SELECT comments.id, art_id AS artId, comments.authorid AS authorId,
           content, comments.created AS dateCreated, (:userIsAdmin OR :userId = comments.authorid) AS canDelete
          FROM comments
          JOIN pageinfo ON art_id = pageinfo.id
          JOIN issues ON num = pageinfo.issue
          WHERE {$where} AND (ispublic != :userLoggedIn OR :userLoggedIn)",
          array_merge($args, [
              'userLoggedIn' => Guard::userIsLoggedIn(),
              'userIsAdmin' => Jwt::getField('level') > 2,
              'userId' => Jwt::getField('id') ? Jwt::getField('id') : ''
          ]))->fetchAll(PDO::FETCH_ASSOC);

          return $result;
    }
}

?>