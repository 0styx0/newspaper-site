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

$rootQueryType = new ObjectType([
    'name' => 'RootQueryType',
    'fields' => [
        new UsersField(),
        new ArticlesField(),
        new IssuesField(),
        new CommentsField()
    ]
]);

$rootMutationType = new ObjectType([
    'name' => 'RootMutationType',
    'fields' => [
        new LoginField()
    ]
]);

$processor = new Processor(new Schema([
    'query' => $rootQueryType,
    'mutation' => $rootMutationType
]));

$rawBody = file_get_contents('php://input');
$decodedBody = json_decode($rawBody);

$processor->processPayload($decodedBody->query, (array) $decodedBody->variables);
echo json_encode($processor->getResponseData()) . "\n";

?>