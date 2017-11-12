<?php

use PHPUnit\Framework\TestCase;

use Lcobucci\JWT\Builder;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Parser;
use Faker\Provider\Base;

require_once(__DIR__ . '/../../vendor/autoload.php');
require_once(__DIR__ . '/../../public/graphql.php');

class HelpTests extends TestCase {

    public static function faker() {
        return Faker\Factory::create();
    }

    public static $unsafeData = [
        '<script>alert("hi")</script>',
        '<?php echo "hello" ?>',
        '<p onClick="alert(hi)">goodbye</p>'
    ];


    /**
      * Helper method to create http request to api while passing along the jwt
      *
      * @param $args - assoc array [query => query_string, variables?: assoc_array]
      * @param $operationName - graphql operation name
      * @param $jwt - string, json web token
      *
      * @return data given back by graphql
      */
    public static function createHTTPRequest(array $args, string $operationName, string $jwt = null, $debug = false) {

        if ($jwt) {
            header("Authorization: Bearer {$jwt}");
            $_POST['jwt'] = "Bearer {$jwt}";
        }

        $_POST['graphql'] = json_encode($args);
        $result = process();

        return json_decode($result, true);
    }

    /**
     * @param $user - 1 element of @see TestDatabase->users
     *
     * @return a json web token valid for $user
     */
    public static function getJwt(array $user) {

        $signer = new Sha256();

        return (new Builder())->setIssuer('https://tabceots.com')
                                ->setAudience('https://tabceots.com')
                                ->setIssuedAt(time())
                                ->setId($user['id'], true)
                                ->set('profileLink', HelpTests::getProfileLink($user['email']))
                                ->set('level', $user['level'])
                                ->set('id', $user['id'])
                                ->sign($signer, $_ENV['JWT_SECRET'])
                                ->getToken(); // Retrieves the generated token
    }

    public static function decodeJwt(string $jwt) {

        $parsedToken = (new Parser())->parse($jwt);

        return $parsedToken; // Retrieves the token claims
    }

    /**
     * Asserts two arrays are equal without regard to order
     */
    public function compareArrayContents(array $expected, array $actual) {

        sort($expected);
        sort($actual);

        // https://stackoverflow.com/a/28189403
        $this->assertEquals($expected, $actual);
    }

    /**
     * Searches array for an element with a certain value
     *
     * @param $array - haystack
     * @param $qualifier - function applied to each element
     * @param $outsideVariables - anything that you want to access from inside $qualifier, will be passed as second argument
     *
     * @return element of array where $qualifier returns true
     */
    public static function searchArray(array $array, callable $qualifier, $outsideVariables = null) {

        foreach ($array as $element) {

            if ($qualifier($element, $outsideVariables)) {
                return $element;
            }
        }
    }

    public static function getProfileLink(string $email) {

        return explode('@', $email)[0];
    }

    /**
     * @param $variableTypes - graphql variables with type. Example: ['$num: => 'ID', '$limit': 'Int']
     *
     * @return $variableTypes converted to a string
     *
     * @example convertVariableArrayToGraphql(['$num' => 'ID']) =>
     *   ['types' => '$num: ID', 'mappings' => 'num: $num']
     */
    public static function convertVariableArrayToGraphql(array $variableTypes) {

        $variableArr = [];
        $keyMappingsArr = [];

        foreach ($variableTypes as $field => $type) {

            $variableArr[] = "{$field}: {$type}"; // $num: ID
            $keyMappingsArr[] = substr($field, 1) . ":{$field}"; // num: $num
        }

        $variablesString = implode(',', $variableArr);
        $keyMappingsString = implode(',', $keyMappingsArr);

        return ['types' => $variablesString, 'mappings' => $keyMappingsString];
    }
}


?>