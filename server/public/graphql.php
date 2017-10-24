<?php

require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = new Dotenv\Dotenv(__DIR__ . '/../');
$dotenv->load();

use Youshido\GraphQL\Execution\Processor;
use Youshido\GraphQL\Schema\Schema;
use Youshido\GraphQL\Type\Object\ObjectType;


require_once(__DIR__ . '/../src/graphql/fields/queries/articles.php');
require_once(__DIR__ . '/../src/graphql/fields/queries/comments.php');
require_once(__DIR__ . '/../src/graphql/fields/queries/issues.php');
require_once(__DIR__ . '/../src/graphql/fields/mutations/login.php');
require_once(__DIR__ . '/../src/graphql/fields/queries/users.php');
require_once(__DIR__ . '/../src/graphql/fields/queries/allTags.php');
require_once(__DIR__ . '/../src/graphql/fields/queries/mission.php');
require_once(__DIR__ . '/../src/graphql/fields/mutations/createComment.php');
require_once(__DIR__ . '/../src/graphql/fields/mutations/deleteComment.php');
require_once(__DIR__ . '/../src/graphql/fields/mutations/updateIssue.php');
require_once(__DIR__ . '/../src/graphql/fields/mutations/createUser.php');
require_once(__DIR__ . '/../src/graphql/fields/mutations/updateUsers.php');
require_once(__DIR__ . '/../src/graphql/fields/mutations/deleteUsers.php');
require_once(__DIR__ . '/../src/graphql/fields/mutations/updateProfile.php');
require_once(__DIR__ . '/../src/graphql/fields/mutations/recoverPassword.php');
require_once(__DIR__ . '/../src/graphql/fields/mutations/createArticle.php');
require_once(__DIR__ . '/../src/graphql/fields/mutations/updateArticles.php');
require_once(__DIR__ . '/../src/graphql/fields/mutations/deleteArticles.php');
require_once(__DIR__ . '/../src/graphql/fields/mutations/editMission.php');

$rootQueryType = new ObjectType([
    'name' => 'RootQueryType',
    'fields' => [
        new UsersField(),
        new ArticlesField(),
        new IssuesField(),
        new CommentsField(),
        new AllTagsField(),
        new MissionField()
    ]
]);

$rootMutationType = new ObjectType([
    'name' => 'RootMutationType',
    'fields' => [
        new LoginField(),
        new CreateCommentField(),
        new DeleteCommentField(),
        new UpdateIssueField(),
        new CreateUserField(),
        new UpdateUsersField(),
        new DeleteUsersField(),
        new UpdateProfileField(),
        new RecoverPasswordField(),
        new CreateArticleField(),
        new UpdateArticlesField(),
        new DeleteArticlesField(),
        new EditMissionField()
    ]
]);

$processor = new Processor(new Schema([
    'query' => $rootQueryType,
    'mutation' => $rootMutationType
]));

$rawBody = file_get_contents('php://input');
$decodedBody = json_decode($rawBody);

$variables = isset($decodedBody->variables) ? (array) $decodedBody->variables : [];

$processor->processPayload($decodedBody->query, (array) $variables);
echo json_encode($processor->getResponseData()) . "\n";

?>