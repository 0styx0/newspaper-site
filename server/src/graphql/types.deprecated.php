<?php


use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;


class Query {

    public static $Users;

}

Query::$Users = new ObjectType([
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
            // 'articles' => [
            //     'type' => Type::nonNull(/* Articles */),
            //     'resolve' => function($user) {

            //         throw new Error('Implement jwt');
            //     }
            // ],
            'canEdit' => [
                'type' => Type::boolean(),
                'resolve' => function($user) {

                    throw new Error('Implement jwt');
                }
            ]
        ]
    ]);

$Articles = new ObjectType([
    'name' => 'Articles',
    'description' => 'Articles created by users',
    'fields' => [
        'id' => [
            'type' => Type::nonNull(Type::id())
        ],
        'dateCreated' => [
            'type' => Type::nonNull(Type::string()),
            'resolve' => function($article) {
                return $article->created;
            }
        ],
        'lede' => [
            'type' => Type::nonNull(Type::string())
        ],
        'url' => [
            'type' => Type::nonNull(Type::string())
        ],
        'article' => [
            'type' => Type::nonNull(Type::string()),
            'resolve' => function($article) {

                throw new Error('Implement cookie, add view');

                $content = $article->lede . $article->body;

                foreach($article->img_url || [] as $img) {

                    $imagePos = strpos('data-src');

                    if ($imagePos !== false) {
                        // https://stackoverflow.com/a/1252710
                        $content = substr_replace($content, "src='${$img}'", $imagePos, strlen('data-src'));
                    }
                }

                return $content;
            }
        ],
        'issue' => [
            'type' => Type::nonNull(Type::int())
        ],
        'views' => [
            'type' => Type::nonNull(Type::int())
        ],
        'displayOrder' => [
            'type' => Type::nonNull(Type::int()),
            'resolve' => function($article) {
                return $article->display_order;
            }
        ],
        'tags' => [
            'type' => Type::nonNull(Type::listOf(Type::string())),
            'resolve' => function($article) {
        // to be continued

            }
        ]
    ]
]);






?>