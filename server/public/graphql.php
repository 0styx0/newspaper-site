<?php

require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = new Dotenv\Dotenv(__DIR__ . '/../');
$dotenv->load();

use Youshido\GraphQL\Execution\Processor;
use Youshido\GraphQL\Schema\Schema;
use Youshido\GraphQL\Type\Object\ObjectType;


require_once(__DIR__ . '/../src/graphql/types/users.php');
require_once(__DIR__ . '/../src/graphql/types/login.php');
require_once(__DIR__ . '/../src/graphql/types/articles.php');

$rootQueryType = new ObjectType([
    'name' => 'RootQueryType',
    'fields' => [
        new UsersField(),
        new ArticlesField()
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

$processor->processPayload($decodedBody->query, $decodedBody->variables);
echo json_encode($processor->getResponseData()) . "\n";

?>