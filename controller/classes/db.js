
const dbInfo = require('../../config').DB;

const Promise = require("bluebird");

module.exports = Promise.promisifyAll(require("node-querybuilder").QueryBuilder({
    "host": dbInfo.HOST,
    "port": dbInfo.PORT,
    "user": dbInfo.USER,
    "password": dbInfo.PASS,
    "database": dbInfo.NAME,
    "debug": true
}, 'mysql', 'single'));
