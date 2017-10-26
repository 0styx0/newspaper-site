<?php

require_once(__DIR__ . '/../../vendor/autoload.php');

use Faker\Provider\Base;



/**
  * Methods generate data in same format as expected as in database rows with method name
  * @example GenerateMockValues->user will generate data fit for insertion into database's `user` table
  *
  */
class GenerateMockRow {

    private static $faker; // as to avoid duplicate fields later, need 1 instance of faker only

    public function __construct() {
        GenerateMockRow::$faker = Faker\Factory::create();
    }

    public function user() {

        return [
            'id' => GenerateMockRow::$faker->unique()->randomNumber() + 1,
            'username' => GenerateMockRow::$faker->unique()->userName(),
            'f_name' => GenerateMockRow::$faker->firstName(),
            'm_name' => GenerateMockRow::$faker->boolean() ? GenerateMockRow::$faker->suffix() : null,
            'l_name' => GenerateMockRow::$faker->lastName(),
            'password' => GenerateMockRow::$faker->password(),
            'email' => GenerateMockRow::$faker->email(),
            'level' => rand(1, 3),
            'auth' => GenerateMockRow::$faker->password(),
            'auth_time' => GenerateMockRow::$faker->date(),
            'notifications' => +GenerateMockRow::$faker->boolean(),
            'two_fa_enabled' => +GenerateMockRow::$faker->boolean()
        ];
    }

    public function tag_list() {

        return [
          'tag' => GenerateMockRow::$faker->unique()->word().substr(0, 20) // varchar(20)
        ];
    }

    public function issue() {

        return [
            'num' => GenerateMockRow::$faker->unique()->randomNumber(),
            'ispublic' => 1,
            'name' => GenerateMockRow::$faker->unique()->name(),
            'madepub' => GenerateMockRow::$faker->date()
        ];
    }

    private function randomHtml() {

        return strip_tags(GenerateMockRow::$faker->randomHtml(), "<h1><h2><h3><h4><h5><h6><pre><img><p><a><table><td><tr><th><tbody><thead><tfoot><strong><b><em><i><u><sub><sup><font><strike><ul><ol><li><q><blockquote><br><abbr><div><span>");
    }

    public function pageinfo() {

        $faker = GenerateMockRow::$faker;

        $url = '';

        while (strlen($url) < $_ENV['URL_LENGTH']) {
            $url .= $faker->unique()->domainWord();
        }

        return [
            'id' => GenerateMockRow::$faker->unique()->randomNumber() + 1,
            'created' => GenerateMockRow::$faker->date(),
            'url' => $url,
            'lede' => "
                <h1>{$faker->word()}</h1>
                <h4>{$faker->name()}</h4>
                <p>{$faker->paragraph()}</p>",
            'body' => $this->randomHtml(),
            'issue' => GenerateMockRow::$faker->randomNumber(), // todo: replace, foreign key
            'authorid' => GenerateMockRow::$faker->randomNumber(), // ditto
            'views' => GenerateMockRow::$faker->randomNumber(),
            'display_order' => GenerateMockRow::$faker->randomNumber()
        ];
    }

    public function image() {

        return [
            'id' => GenerateMockRow::$faker->unique()->randomNumber() + 1,
            'art_id' => GenerateMockRow::$faker->unique()->randomNumber(),
            'slide' => +GenerateMockRow::$faker->boolean(),
            'url' => GenerateMockRow::$faker->imageUrl()
        ];
    }

    public function tag() {

        return [
            'id' => GenerateMockRow::$faker->unique()->randomNumber() + 1,
            'tag' => GenerateMockRow::$faker->word(), // to be replaced
            'art_id' => GenerateMockRow::$faker->unique()->randomNumber(), // ditto
        ];
    }

    public function comment() {

        return [
            'id' => GenerateMockRow::$faker->unique()->randomNumber() + 1,
            'art_id' => -1, // replaced later
            'authorid' => -1, // replaced later
            'content' => $this->randomHtml(),
            'created' => GenerateMockRow::$faker->date()
        ];
    }
}

?>