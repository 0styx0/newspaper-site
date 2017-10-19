<?php



class Db {

    public static $lastInsertId;

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

            $DBH = new PDO("mysql:host=" . $_ENV['DB_HOST'] .";dbname=" . $_ENV['DB_NAME'] ."", $_ENV['DB_USER'], $_ENV['DB_PASS']);

            $DBH->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $DBH->beginTransaction();

            $query = $DBH->prepare($cmd);

            $query->execute($params);

            Db::$lastInsertId = $DBH->lastInsertId();

            $DBH->commit();

            return $query;
        }
        catch(Exception $e) {


            if ($_ENV['test']) {

                // print_r($params);

                echo explode('?', $cmd)[0];
                echo $e->getMessage();
                exit;
            }

            $DBH->rollback();
        }
    }

    /**
     * @param $keys - assoc array of placeholders
     *
     * @return string of key = :key
     *
     * @example setPlaceholders(['one' => true, 'two' => 456]) => "one = :one, two = :two"
     */
    static function setPlaceholders(array $args) {

        $where = '';

        foreach (array_keys($args) as $field) {

            $where .= "{$field} = :{$field}";
        }

        return $where;
    }

    /**
     * Sets `where` clause of sql
     *
     * @param $args - @see param $args of #setPlaceholders
     *
     * @return Db::setPlaceholders with "where" prepended
     */
    static function setArgs(array $args) {

        if (empty($args)) {
            return '';
        }

        return "WHERE " . Db::setPlaceholders($args);
    }
}



?>