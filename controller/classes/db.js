
const dbInfo = require('../../config').DB;


module.exports = require("node-querybuilder").QueryBuilder({
    "host": dbInfo.HOST,
    "port": dbInfo.PORT,
    "user": dbInfo.USER,
    "password": dbInfo.PASS,
    "database": dbInfo.NAME,
    "debug": true
}, 'mysql', 'single');
