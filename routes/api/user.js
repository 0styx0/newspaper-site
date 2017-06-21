const router = require('express').Router();
const User = require("../../controller/classes/User");
const Utilities = require('../../controller/classes/Utilities');

const UserInstance = new User();


router.get("/", async function(req, res) {

    await UserInstance.defineInfoFor(req.query.user);
    res.send(await UserInstance.getAllUserInfo());
});

router.put('/', async function(req, res) {

    await UserInstance.defineInfoFor(UserInstance.getJWT().id, true);

    if (await UserInstance.checkPassword(req.body.pass)) {

        if (req.body['2fa'] !== undefined) {
            UserInstance.setTwoFactor(req.body['2fa']);
        }

        if (req.body['notifications'] !== undefined) {
            UserInstance.setNotificationStatus(req.body.notifications);
        }

        if (req.body.userEmail) {
            UserInstance.setEmail(req.body.userEmail);
        }
console.log('sdfs');
        UserInstance.destruct();

        Utilities.setHeader(200, 'user(s) updated');
    }

});

module.exports = router