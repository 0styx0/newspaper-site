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
require_once(__DIR__ . '/../src/graphql/fields/mutations/createTag.php');

function process() {

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
            new EditMissionField(),
            new CreateTagField(),
        ]
    ]);

    $processor = new Processor(new Schema([
        'query' => $rootQueryType,
        'mutation' => $rootMutationType
    ]));

    $phpInput = file_get_contents('php://input');

    $graphqlTesting = empty($_POST['graphql']) ? [] : $_POST['graphql'];

    $testing = isset($_ENV['test']) && $_ENV['test'];

    if (empty($_POST['graphql']) && empty($phpInput)) {
        return json_encode(['error' => 'No request']);
    }

    $rawBody = $testing ? $graphqlTesting : $phpInput;
    $decodedBody = json_decode($rawBody, true);

    $variables = isset($decodedBody['variables']) ? $decodedBody['variables'] : [];

    $processor->processPayload($decodedBody['query'], $variables);

    $result = json_encode($processor->getResponseData()) . "\n";

    if ($testing) {
        return $result;
    }

    echo $result;
}

process();

?>