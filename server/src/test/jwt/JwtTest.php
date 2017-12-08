<?php

require_once(__DIR__ . '/../../../vendor/autoload.php');
require_once(__DIR__ . '/helpers.php');

class JwtTest extends JwtTestHelper {

    function testInvalidJwtStringFails() {

        $randomEncodedString = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsZXZlbCI6IjMiLCJpZCI6IjUwIiwicHJvZmlsZUxpbmsiOiJyYW5kb21FbWFpbEBnbWFpbC5jb20ifQ.gM87PwNdQYxBlgRrqY245e6UKM-jIVCaX9lvf89J5Xo';

        $result = $this->request([
            'query' => 'query ArticleQuery {
                articles {
                    public
                }
            }',
            'variables' => []
        ], $randomEncodedString)['articles'];

        $privateArticleInResults = array_search(false, array_column($result, 'public'));

        $this->assertFalse($privateArticleInResults);
    }
}
?>