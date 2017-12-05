<?php

require_once __DIR__ . '/../../vendor/autoload.php';
use Lcobucci\JWT\Parser;
use Lcobucci\JWT\Builder;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\ValidationData;


/**
* Singleton to get json web token
*/
class Jwt {

    public static $token = '';

    public static function hasClaim(string $fieldToGet) {

        return Jwt::$token ? Jwt::$token->hasClaim($fieldToGet) : null;
    }

    /**
    * Gets jwt from http Authorization header
    */
    public static function getField(string $fieldToGet) {

        if (Jwt::$token && !$_ENV['test']) {
            return Jwt::hasClaim($fieldToGet) ? Jwt::$token->getClaim($fieldToGet) : null;
        }

        $clientHeaders = [];

        try {
            $clientHeaders = getallheaders();

        } catch (Error $e) {

            if ($_ENV['test'] && isset($_POST['jwt'])) {
                $clientHeaders = ['authorization' => $_POST['jwt']];
            }
        }

        $jwt = [];

        if (key_exists('authorization', $clientHeaders)) {

            $aHeader = filter_var($clientHeaders['authorization'], FILTER_SANITIZE_STRING);

            $encodedToken = substr($aHeader, strlen('Bearer '));

            try {
                $parsedToken = (new Parser())->parse($encodedToken);
                Jwt::verifyToken($parsedToken);
            } catch (Exception $e) {
                $parsedToken = null;
            } catch (Error $e) {
                print_r(['mes', $e->getMessage()]);
                $parsedToken = null;
            }

            Jwt::$token = $parsedToken; // Retrieves the token claims

            return ($parsedToken && Jwt::hasClaim($fieldToGet)) ? Jwt::$token->getClaim($fieldToGet) : null;
        }

        return null;
    }

    private static function verifyToken(Lcobucci\JWT\Token $token) {

        $signer = new Sha256();
        $data = new ValidationData();

        if (!$token->validate($data) || !$token->verify($signer, $_ENV['JWT_SECRET'])) {
            throw new Exception('User has invalid token');
        }
    }

    /**
     * Creates jwt
     *
     * @param $user - assoc array with keys that include id, (level, profileLink if verified email)
     *
     * @return jwt with that user's info
     */
    public static function setToken(array $user) {

        $signer = new Sha256();

        $token = (new Builder())->setIssuer('https://tabceots.com')
                                ->setAudience('https://tabceots.com')
                                ->setIssuedAt(time())
                                ->setExpiration(time() + 3600)
                                ->setId($user['id'], true)
                                ->set('id', $user['id']);

        $emailIsVerified = $user['profileLink'][0] !== '.';

        if ($emailIsVerified) {

            $token = $token->set('profileLink', $user['profileLink'])
                            ->set('level', $user['level']);
        }

        return $token->sign($signer, $_ENV['JWT_SECRET'])->getToken(); // Retrieves the generated token
    }

}
?>