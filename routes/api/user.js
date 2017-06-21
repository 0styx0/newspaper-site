const router = require('express').Router();
const User = require("../../controller/classes/User");
const Utilities = require('../../controller/classes/Utilities');

const UserInstance = new User();


router.get("/", async function(req, res) {

    if(!await UserInstance.defineInfoFor(req.query.user)) {

        return Utilities.setHeader(404, 'user not found');
    }

    const info = await UserInstance.getAllUserInfo();

    res.send(info);
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

        UserInstance.destruct();

        Utilities.setHeader(200, 'user(s) updated');
    }

});

router.delete('/', async function(req, res) {

    await UserInstance.defineInfoFor(UserInstance.getJWT().id, true);

    if (await UserInstance.checkPassword(req.body.password)) {
        UserInstance.destroy(UserInstance.getJWT().id)

        Utilities.setHeader(200, 'user deleted')
    }

});

module.exports = router