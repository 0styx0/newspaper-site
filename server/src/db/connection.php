<?php



class Db {

    public static $lastInsertId;
    private static $DBH;

    /**
     * <p>
     * All database related stuff passes through here
     * </p>
     *
     * @param $cmd - query, anything that would be valid sql (SELECT USERS WHERE id = ?)
     *
     * @param $params - parameters for $query (would give value of question marks)
     *
     * @return the executed query
     */
    static function query(string $cmd, array $params = []) {

        try {

            if (!Db::$DBH) {

                // Db::$DBH = new PDO("mysql:unix_socket=/opt/lampp/var/mysql/mysql.sock;dbname=" . $_ENV['DB_NAME'] . "", $_ENV['DB_USER'], $_ENV['DB_PASS']);
                Db::$DBH = new PDO("mysql:host=" . $_ENV['DB_HOST'] .";port=3306;dbname=" . $_ENV['DB_NAME'] ."", $_ENV['DB_USER'], $_ENV['DB_PASS']);

                Db::$DBH->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            }

            $DBH = Db::$DBH;

            $DBH->beginTransaction();

            $query = $DBH->prepare($cmd);

            $query->execute($params);

            Db::$lastInsertId = $DBH->lastInsertId();

            $DBH->commit();

            return $query;
        }
        catch(Exception $e) {

            if ($_ENV['dev']) {

                // print_r($params);

                echo explode('?', $cmd)[0];
                echo $e->getMessage();
                /* exit; */
            }

	    if ($DBH) {
                $DBH->rollback();
	    }

            throw new Exception('Error saving data');
        }
    }

    static function dbInitialized() {

        try {
            return !!(!empty($_SERVER['db_initialized']) || Db::query("SELECT * FROM pageinfo")->fetch());
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * @param $args - assoc array of placeholders
     *
     * @return string of key = :key
     *
     * @example setPlaceholders(['one' => true, 'two' => 456]) => "one = :one, two = :two"
     */
    static function setPlaceholders(array $args) {

        $where = [];

        foreach (array_keys($args) as $field) {

            $where[] = "{$field} = :{$field}";
        }

        return implode(' AND ', $where);
    }

    /**
     * Sets `where` clause of sql
     *
     * @param $args - assoc array of placeholders
     *
     * @return Db::setPlaceholders with "where" prepended
     */
    static function setArgs(array $args) {

        if (empty($args)) {
            return '';
        }

        return "WHERE " . Db::setPlaceholders($args);
    }

    /**
     * Generates a string of comma separated '?', one '?' for each elt in $params
     *
     * @param $params - length will determine how many question marks are generated
     *
     */
    static function generatePlaceholders($params) {

        return implode(',', array_fill(0, count($params), '?'));
    }
}



?>
