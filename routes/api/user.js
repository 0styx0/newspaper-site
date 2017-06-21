const router = require('express').Router();
const User = require("../../controller/classes/User");

router.get("/", async function(req, res) {

    const UserInstance = new User();

    await UserInstance.defineInfoFor(req.query.user);

    res.send(await UserInstance.getAllUserInfo());
});

module.exports = router