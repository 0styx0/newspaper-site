<?php

require_once(__DIR__ . '/../../vendor/autoload.php');
require_once(__DIR__ . '/GenerateMockRows.php');
use Faker\Provider\Base;

$dotenv = new Dotenv\Dotenv(__DIR__ . '/../../');
$dotenv->load();

class TestDatabase {

    public $GenerateRows;

    // leaving this and #loadDatabase in, but don't use. For some reason before #loadDatabase finished, tests run and that causes bad password errors
    private static $generateNewDatabase = true; // NOTE: passwords and auth codes will still be changed if true

    public function __construct($initializingNewProject = false) {

        if (!$_ENV['test'] && !$initializingNewProject) {
            throw new Error('DO NOT DELETE DATABASE IF NOT IN TEST MODE!!!!!'); // no story behind this :-)
        }

        $this->GenerateRows = new GenerateMockRows();
    }

    public function connect() {

        $this->DBH = new PDO("mysql:host=" . $_ENV['DB_HOST'], $_ENV['DB_USER'], $_ENV['DB_PASS']);

        $this->DBH->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function create() {

        $schema = file_get_contents(__DIR__ . '/../../../schema.sql');

        $this->DBH->query("CREATE DATABASE IF NOT EXISTS {$_ENV['DB_NAME']}");
        $this->DBH->query("USE {$_ENV['DB_NAME']}");
        $this->DBH->query($schema);
    }

    private function loadDatabase() {

        $tables = [
            'users',
            'issues',
            'pageinfo',
            'tag_list',
            'tags',
            'comments',
            'images'
        ];

        foreach ($tables as $table) {

            $this->GenerateRows->{$table} = Db::query("SELECT * FROM {$table}")->fetchAll(PDO::FETCH_ASSOC);
        }

        $hashed = [];
        foreach ($this->GenerateRows->users as $i => $user) {

            $this->GenerateRows->users[$i]['password'] = TestHelper::faker()->unique()->password();
            $this->GenerateRows->users[$i]['auth'] = TestHelper::faker()->unique()->password();

            $hashed[] = $user['id'];
            $hashed[] = password_hash($this->GenerateRows->users[$i]['password'], PASSWORD_DEFAULT);
            print_r([$this->GenerateRows->users[$i]['password'], $hashed[count($hashed) - 1]]);
            $hashed[] = password_hash($this->GenerateRows->users[$i]['auth'], PASSWORD_DEFAULT);
        }

        $this->GenerateRows->issues = array_reverse($this->GenerateRows->issues);

        $placeholders = implode(',', array_fill(0, count($this->GenerateRows->users), '(?, ?, ?)'));

        return Db::query("INSERT INTO users (id, password, auth) VALUES {$placeholders} ON DUPLICATE KEY UPDATE password = password, auth = auth", $hashed);
    }

    /**
     * Inserts data into db
     *
     * @param $tables - ['table_name' => rows], where rows is an assoc array of columnName => value
     */
    public function insertMockData(array $tables) {

        foreach ($tables as $tableName => $table) {


            $fields = implode(',', array_keys($table[0]));

            $valuesArr = array_reduce($table, function ($accum, $row) {

                if (!empty($row['password'])) {
                    $row['password'] = password_hash($row['password'], PASSWORD_DEFAULT);
                    $row['auth'] = password_hash($row['auth'], PASSWORD_DEFAULT);
                }

                return array_merge($accum, array_values($row));
            }, []);

            $placeholdersArr = array_reduce($table, function ($accum, $row) {

                return array_merge($accum, [implode(',', array_fill(0, count($row), '?'))]);
            }, []);

            $placeholders = implode('),(', $placeholdersArr);

            Db::Query("INSERT INTO {$tableName} ({$fields}) VALUES ({$placeholders})", $valuesArr);

        }
    }

    private function drop() {
        $this->DBH->query("DROP DATABASE {$_ENV['DB_NAME']}");
    }

    public function init() {

        if (!TestDatabase::$generateNewDatabase) {
            return $this->loadDatabase();
        }

        $this->connect();

        try {
            $this->drop(); // in case db already exists
        } catch(PDOException $e) { /* do nothing since db *shouldn't* exist */ }

        $this->create();

        $this->GenerateRows->all();
        $tables = [
            'users' => $this->GenerateRows->users,
            'issues' => $this->GenerateRows->issues,
            'pageinfo' => $this->GenerateRows->pageinfo,
            'tag_list' => $this->GenerateRows->tag_list,
            'tags' => $this->GenerateRows->tags,
            'comments' => $this->GenerateRows->comments,
            'images' => $this->GenerateRows->images
        ];

        $this->insertMockData($tables);
    }

    /**
     * @return random user that is in database
     */
    public function getRandomUser() {

        $faker = Faker\Factory::create();

        return $faker->randomElement($this->GenerateRows->users);
    }

    /**
     *
     * @param $level - level of user to get
     *
     * @return user of level $level from database
     */
    public function getUserOfLevel(int $level) {

        return TestHelper::searchArray($this->GenerateRows->users, function (array $currentUser, int $levelToGet) {
            return $currentUser['level'] == $levelToGet;
        }, $level);
    }
}


?>