<?php

require_once('../../vendor/autoload.php');

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

$Users = new ObjectType([
    'name' => 'Users',
    'description' => 'Account holders of the site',
    'fields' => [
        'id' => [
            'type' => Type::nonNull(Type::id()),
        ],
        'username' => [
            'type' => Type::nonNull(Type::string())
        ],
        'firstName' => [
            'type' => Type::nonNull(Type::string()),
            'resolve' => function($user) {
                return $user->f_name;
            }
        ],
        'middleName' => [
            'type' => Type::string(),
            'resolve' => function($user) {
                return $useer->m_name;
            }
        ],
        'lastName' => [
            'type' => Type::nonNull(Type::string()),
            'resolve' => function ($user) {
                return $user->l_name;
            }
        ],
        'email' => [
            'type' => Type::nonNull(Type::string()),
            'resolve' => function ($user) {
                throw new Error('Implement jwt');
            }
        ],
        'level' => [
            'type' => Type::nonNull(Type::int())
        ],
        'notifications' => [
            'type' => Type::boolean(),
            'resolve' => function($user) {

                throw new Error('Implement jwt');
            }
        ],
        'twoFactor' => [
            'type' => Type::boolean(),
            'resolve' => function($user) {

                throw new Error('Implement jwt');
            }
        ],
        'views' => [
            'type' => Type::int(),
            'resolve' => function($user) {

                throw new Error('Implement jwt');
            }
        ],
        'articleCount' => [
            'type' => Type::int(),
            'resolve' => function($user) {

                throw new Error('Implement jwt');
            }
        ],
        'profileLink' => [
            'type' => Type::nonNull(Type::string()),
            'resolve' => function($user) {
                return explode('@', $user->email)[0];
            }
        ],
        'articles' => [
            'type' => Type::nonNull(/* Articles */),
            'resolve' => function($user) {

                throw new Error('Implement jwt');
            }
        ],
        'canEdit' => [
            'type' => Type::boolean(),
            'resolve' => function($user) {

                throw new Error('Implement jwt');
            }
        ]
    ],
]);






?>