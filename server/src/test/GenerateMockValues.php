<?php

require_once(__DIR__ . '/../../vendor/autoload.php');

use Faker\Provider\Base;



/**
  * Methods generate data in same format as expected as in database rows with method name
  * @example GenerateMockValues->user will generate data fit for insertion into database's `user` table
  *
  */
class GenerateMockRow {

    public function user($amount = 1) {

        $faker = Faker\Factory::create();

        return [
            'id' => $faker->unique()->randomNumber(),
            'username' => $faker->unique()->userName(),
            'f_name' => $faker->firstName(),
            'm_name' => $faker->boolean() ? $faker->suffix() : null,
            'l_name' => $faker->lastName(),
            'password' => $faker->password(),
            'email' => $faker->email(),
            'level' => rand(1, 3),
            'auth' => $faker->password(),
            'auth_time' => $faker->date(),
            'notifications' => +$faker->boolean(),
            'two_fa_enabled' => +$faker->boolean()
        ];
    }

    public function tag_list() {

        $faker = Faker\Factory::create();

        return [
          'tag' => $faker->unique()->word()
        ];
    }

    public function issue() {

        $faker = Faker\Factory::create();

        return [
            'num' => $faker->unique()->randomNumber(),
            'ispublic' => 1,
            'name' => $faker->unique()->name(),
            'madepub' => $faker->date()
        ];
    }

    public function pageinfo() {

        $faker = Faker\Factory::create();

        return [
            'id' => $faker->unique()->randomNumber(),
            'created' => $faker->date(),
            'url' => $faker->domainWord(),
            'lede' => "
                <h1>{$faker->word()}</h1>
                <h4>{$faker->name()}</h4>
                <p>{$faker->paragraph()}</p>",
            'body' => $faker->randomHtml(),
            'issue' => $faker->randomNumber(), // todo: replace, foreign key
            'authorid' => $faker->randomNumber(), // ditto
            'views' => $faker->randomNumber(),
            'display_order' => $faker->randomNumber()
        ];
    }

    public function image() {

        $faker = Faker\Factory::create();

        return [
            'id' => $faker->unique()->randomNumber(),
            'art_id' => $faker->unique()->randomNumber(),
            'slide' => +$faker->boolean(),
            'url' => $faker->image()
        ];
    }

    public function tag() {

        $faker = Faker\Factory::create();

        return [
            'id' => $faker->unique()->randomNumber(),
            'tag' => $faker->word(), // to be replaced
            'art_id' => $faker->unique()->randomNumber(), // ditto
        ];
    }

    public function comment() {

        $faker = Faker\Factory::create();

        return [
            'id' => $faker->unique()->randomNumber(),
            'art_id' => $faker->unique()->randomNumber(), // replace
            'authorid' => $faker->unique()->randomNumber(), // replace
            'content' => $faker->randomHtml(),
            'created' => $faker->date()
        ];
    }
}

?>