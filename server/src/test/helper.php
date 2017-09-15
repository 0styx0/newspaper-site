<?php

require_once('../vendor/autoload.php');

class Helper {

   /**
     * @return random user that is in database
     */
    public static function getRandomUser() {
        throw new Error('Not implemented');
    }

    /**
      * Helper method to create http request to api while passing along the jwt
      *
      * @param $args - assoc array [query => query_string, variables?: assoc_array]
      * @param $operationName - graphql operation name
      * @param $jwt - string, json web token
      *
      * @return data given back by graphql
      */
    public static function createHTTPRequest(array $args, string $operationName, string $jwt) {

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($query));

        //   curl_setopt($ch, CURLOPT_VERBOSE, true);

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // makes response get returned instead of echoing to terminal
        curl_setopt($ch, CURLOPT_HEADER, 1);

        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // follow redirects (since .htaccess forces all api stuff through /router)
        curl_setopt($ch, CURLOPT_HTTPHEADER, array("Accept: application/json", 'Content-type: application/json'));
        curl_setopt($ch, CURLOPT_COOKIE, $jwtCookie);
        $content = trim(curl_exec($ch));
        $res_info = curl_getinfo($ch);

        HelpTests::getCookiesFromCurl($content);

        $api_response_body = substr($content, $res_info['header_size']);

        //echo "\n". debug_backtrace()[2]['function']. " : ".$res_info["http_code"];
        curl_close($ch);

        if ($debug) {
            echo "HERE";print_r([$content,$api_response_body]);
        }

        return (empty(json_decode($api_response_body))) ? $res_info["http_code"] : json_decode($api_response_body);
    }

}


?>