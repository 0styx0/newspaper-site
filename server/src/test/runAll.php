<?php

$filesToTest = [
    './articles/mutations/createArticleTest.php'
];

foreach ($filesToTest as $file) {
    echo `clear; ../../vendor/phpunit/phpunit/phpunit {$file} --stop-on-failure --stop-on-error`;
}