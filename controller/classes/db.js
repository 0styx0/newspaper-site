
const dbInfo = require('../../config').DB;


const bluebird = require("bluebird");
const  mysql = require('mysql2/promise');

module.exports = mysql.createConnection({
    "host": dbInfo.HOST,
    "port": dbInfo.PORT,
    "user": dbInfo.USER,
    "password": dbInfo.PASS,
    "database": dbInfo.NAME
  });

