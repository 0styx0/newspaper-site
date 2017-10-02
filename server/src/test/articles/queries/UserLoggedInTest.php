<?php


require_once(__DIR__ . '/../../../../vendor/autoload.php');
require_once(__DIR__ . '/../helpers.php');

class UserLoggedInTest extends ArticleTest {

    function testCanSeeAnyArticle() {

        $user = $this->TestDatabase->getRandomUser();
        $expectedIds = array_column($this->TestDatabase->pageinfo, 'id');

        $data = $this->request([
            'query' => 'query articles {
                            articles {
                                id
                            }
                        }'
        ], HelpTests::getJwt($user));

        $this->expectEqual($expectedIds, array_column($data['articles'], 'id'));
    }

    function testCanEditOwnArticles() {

    }

    function testCanEditLowerLevelArticles() {

    }

    function testCannotEditHigherOrEqualLevelArticles() {
        
    }
}

?>