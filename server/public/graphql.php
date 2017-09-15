<?php

require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = new Dotenv\Dotenv(__DIR__ . '/../');
$dotenv->load();

use Youshido\GraphQL\Execution\Processor;
use Youshido\GraphQL\Schema\Schema;
use Youshido\GraphQL\Type\Object\ObjectType;

require_once __DIR__ . '/../src/graphql/types/users.php';       // including PostType definition

$rootQueryType = new ObjectType([
    'name' => 'RootQueryType',
    'fields' => [
        new UsersField()
    ]
]);

$processor = new Processor(new Schema([
    'query' => $rootQueryType
]));

$rawBody = file_get_contents('php://input');
$decodedBody = json_decode($rawBody);

$payload = '{ users { username, id } }';

$processor->processPayload($decodedBody->query, $decodedBody->variables);
echo json_encode($processor->getResponseData()) . "\n";

?>