const router = require('express').Router();
const Info = require('../../controller/classes/Info');

router.get("/", async function(req, res) {

    const InfoInstance = new Info();

    res.send(await InfoInstance.getUsersInfo());
});

module.exports = router;