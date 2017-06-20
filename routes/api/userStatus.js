const router = require('express').Router();
const User = require("../../controller/classes/User");
const Utilities = require("../../controller/classes/Utilities");

router.put('*', async function(req, res) {

    const UserInstance = new User();

    if (req.body.authCode) {

        return res.send(await UserInstance.login(UserInstance.getJWT().email, req.body.password, req.body.authCode))
    }


    if (req.body.username && req.body.password) {
        return res.send(await UserInstance.login(req.body.username, req.body.password));
    }

    if (req.body.logout) {
        return res.send(UserInstance.logout());
    }

    return res.send(Utilities.setHeader(422, "missing required field"));

});

router.get('*', function(req, res) {

    const UserInstance = new User();

    res.send(UserInstance.getJWT());
});

module.exports = router