<?php

$filesToTest = [
    './articles/mutations/createArticleTest.php',
    './articles/mutations/deleteArticleTest.php',
    './articles/mutations/updateArticleTest.php',
    'articles/mutations/editArticleTest.php',
    './articles/queries/UserLoggedInTest.php',
    './articles/queries/UserNeutralTest.php',
    './articles/queries/UserNotLoggedIn.php',
    './comments/mutations/createComment.php',
    './comments/mutations/deleteComment.php',
    './comments/queries/NeutralUser.php',
    './comments/queries/NotLoggedIn.php',
    './issues/mutations/updateIssue.php',
    './issues/queries/UserLoggedIn.php',
    './issues/queries/UserNeutral.php',
    './issues/queries/UserNotLoggedIn.php',
    './login/loginTest.php',
    './mission/mutation/missionEditTest.php',
    './mission/query/missionTest.php',
    './recoverPassword/mutations/recoverPasswordTest.php',
    './tags/mutations/createTagTest.php',
    './tags/query/tagsTest.php',
    './users/mutations/createTest.php',
    './users/mutations/deleteTest.php',
    './users/mutations/profileTest.php',
    './users/mutations/updateTest.php',
    './users/queries/UserLoggedInTest.php',
    './users/queries/UserNeutralTest.php',
    './users/queries/UserNotLoggedInTest.php',
    './verifyEmail/mutations/verifyEmailTest.php',
    './jwt/JwtTest.php'
];

echo `clear`;

foreach ($filesToTest as $file) {
    echo "\nTesting " . $file . "\n";
    echo `../../vendor/phpunit/phpunit/phpunit {$file} --stop-on-failure --stop-on-error --stderr`;
}