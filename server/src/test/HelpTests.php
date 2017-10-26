<?php

use PHPUnit\Framework\TestCase;

use Lcobucci\JWT\Builder;
use Lcobucci\JWT\Signer\Hmac\Sha256;

use Faker\Provider\Base;

require_once(__DIR__ . '/../../vendor/autoload.php');

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

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($args));
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        //   curl_setopt($ch, CURLOPT_VERBOSE, true);

        curl_setopt($ch, CURLOPT_URL, 'http://localhost/graphql.php');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // makes response get returned instead of echoing to terminal
        curl_setopt($ch, CURLOPT_HEADER, 1);

        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // follow redirects (since .htaccess forces all api stuff through /router)

        $headers = [
            'Accept: application/json',
            'Content-type: application/graphql'
        ];

        if ($jwt) {
            array_push($headers, "Authorization: Bearer {$jwt}");
        }

        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $content = trim(curl_exec($ch));
        $res_info = curl_getinfo($ch);

        $api_response_body = (array) json_decode(substr($content, $res_info['header_size']), true);

        // echo "\n". debug_backtrace()[2]['function']. " : ".$res_info["http_code"];
        curl_close($ch);

        if (true || $debug) {
            echo "HERE";print_r([$res_info, $content,$api_response_body]);
        }

        if ($debug && isset($api_response_body['errors'])) {
            echo "Caller: " . debug_backtrace()[2]['function'] . "\n";
            echo "Args: "; print_r($args);
            echo substr($content, $res_info['header_size']); // api_response_body, but not decoded
            print_r($api_response_body['errors']);
            throw new Error("Graphql Error");
        }

        return $api_response_body;
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

    /**
     * Asserts two arrays are equal without regard to order
     */
    public function compareArrayContents(array $expected, array $actual) {

        // https://stackoverflow.com/a/28189403
        $this->assertEquals($expected, $actual, "\$canonicalize = true", $delta = 0.0, $maxDepth = 10, $canonicalize = true);
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

        return [];
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