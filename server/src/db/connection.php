<?php

require_once('../../vendor/autoload.php');

class Db {

    static function query() {

        try {

           $DBH = new PDO("mysql:host=" . $_ENV['DB_HOST'] .";dbname=" . $_ENV['DB_NAME'] ."", $_ENV['DB_USER'], $_ENV['DB_PASS']);

            $DBH->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $DBH->beginTransaction();

            $query = $DBH->prepare($cmd);

            $query->execute($params);

            $DBH->commit();

            return $query;
        }
        catch(Exception $e) {

            $DBH->rollback();
        }
    }
}



?>