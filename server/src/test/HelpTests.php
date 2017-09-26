<?php

use PHPUnit\Framework\TestCase;

require_once(__DIR__ . '/../../vendor/autoload.php');

class HelpTests extends TestCase {

    /**
      * Helper method to create http request to api while passing along the jwt
      *
      * @param $args - assoc array [query => query_string, variables?: assoc_array]
      * @param $operationName - graphql operation name
      * @param $jwt - string, json web token
      *
      * @return data given back by graphql
      */
    public static function createHTTPRequest(array $args, string $operationName, string $jwt, $debug = false) {

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($args));
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        //   curl_setopt($ch, CURLOPT_VERBOSE, true);

        curl_setopt($ch, CURLOPT_URL, 'http://localhost/graphql.php');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // makes response get returned instead of echoing to terminal
        curl_setopt($ch, CURLOPT_HEADER, 1);

        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // follow redirects (since .htaccess forces all api stuff through /router)
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept: application/json', 'Content-type: application/graphql'));
        curl_setopt($ch, CURLOPT_COOKIE, $jwt);
        $content = trim(curl_exec($ch));
        $res_info = curl_getinfo($ch);

        HelpTests::getCookiesFromCurl($content);

        $api_response_body = (array) json_decode(substr($content, $res_info['header_size']), true);

        // echo "\n". debug_backtrace()[2]['function']. " : ".$res_info["http_code"];
        curl_close($ch);

        if ($debug) {
            echo "HERE";print_r([$res_info, $content,$api_response_body]);
        }

        if (isset($api_response_body['errors'])) {
            echo "Caller: " . debug_backtrace()[2]['function'] . "\n";
            echo "Args: "; print_r($args);
            echo substr($content, $res_info['header_size']); // api_response_body, but not decoded
            print_r($api_response_body['errors']);
            throw new Error("Graphql Error");
        }

        return $api_response_body;
    }

        /**
      * @param $content - result of curl_exec
      *
      * @return cookies found
      */
    public static function getCookiesFromCurl($content) {

        preg_match('/Set-Cookie[\s\S]+?\n/', $content, $matches);

        if (!empty($matches[0])) {

            preg_match('/jwt=([^;]*)/', $matches[0], $jwt);
            $_COOKIE['eyeStorm-jwt'] = $jwt[1];
        }
    }

    /**
     * Asserts two arrays are equal without regard to order
     */
    public function compareArrayContents(array $expected, array $actual) {

        // https://stackoverflow.com/a/28189403
        $this->assertEquals($expected, $actual, "\$canonicalize = true", $delta = 0.0, $maxDepth = 10, $canonicalize = true);
    }


}


?>