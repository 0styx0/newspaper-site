<?php


class Helper {

        /**
      * Helper method to create http request to api while passing along the jwt
      *
      * @param $url - last part of url in a path like http(s)://{domain name}/api/{$url}
      * @param $query - query string (in format of key1=value1&key2=value2 etc)
      * @param $method - http method GET, POST, PUT, or DELETE
      *
      * @return json decoded data given back by the call
      */
    public static function createHTTPRequest(string $url, array $variables, string $operationName) {

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