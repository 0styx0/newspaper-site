const router = require('express').Router();

const db = require("../../controller/classes/db");


router.all("/", async function(req, res, next) {

    res.send(await db.select('ID').getAsync('USERS'));
});

module.exports = router;