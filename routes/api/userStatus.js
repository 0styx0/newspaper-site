const router = require('express').Router();
const User = require("../../controller/classes/User");
const Utilities = require("../../controller/classes/Utilities");

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

router.put('*', async function(req, res) {

    const UserInstance = new User();

    if (req.body.authCode) {

        return res.send(await UserInstance.login(UserInstance.getJWT().email, req.body.password, req.body.authCode))
    }


    if (req.body.username && req.body.password) {
        return res.send(await UserInstance.login(req.body.username, req.body.password));
    }
console.log(req.body);
    if (req.body.logout) {
        console.log("IN LOG");
        return res.send(UserInstance.logout());
    }

    return res.send(Utilities.setHeader(422, "missing required field"));

});

module.exports = router