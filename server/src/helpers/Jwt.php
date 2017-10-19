<?php

use Lcobucci\JWT\Parser;

/**
* Singleton to get json web token
*/
class Jwt {

    public static $token = '';

    /**
    * Gets jwt from http Authorization header
    */
    public static function getToken() {

        if (Jwt::$token) {
            return Jwt::$token;
        }

        $clientHeaders = getallheaders();
        $jwt = [];

        if (key_exists('Authorization', $clientHeaders)) {

            $aHeader = filter_var($clientHeaders["Authorization"], FILTER_SANITIZE_STRING);

            $encodedToken = substr($aHeader, strlen('Bearer '));

            $parsedToken = (new Parser())->parse($encodedToken);
            Jwt::$token = $parsedToken; // Retrieves the token claims
        }

        return Jwt::$token;
    }

}
?>