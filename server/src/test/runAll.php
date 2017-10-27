<?php

$filesToTest = [
    'articles/mutations/createArticleTest.php',
    'articles/mutations/deleteArticleTest.php'
];

echo `clear`;

foreach ($filesToTest as $file) {
    echo `../../vendor/phpunit/phpunit/phpunit {$file} --stop-on-failure --stop-on-error`;
}