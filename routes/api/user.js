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
console.log(req.body)
    if (req.body.lastAuth && req.body.email) {

        await UserInstance.defineInfoFor(req.body.user)
                          .then(() => UserInstance.forgotPassword(req.body.email, req.body.lastAuth))
                          .then(() => UserInstance.destruct());
    }
    else {

        await UserInstance.defineInfoFor(UserInstance.getJWT().id, true);
    }


    if (await UserInstance.checkPassword(req.body.password)) {

        if (req.body['2fa'] !== undefined) {
            UserInstance.setTwoFactor(req.body['2fa']);
        }

        if (req.body['notifications'] !== undefined) {
            UserInstance.setNotificationStatus(req.body.notifications);
        }

        if (req.body.newPass) {
            await UserInstance.setPassword(req.body.newPass, req.body.passConf);
        }

        if (req.body.userEmail) {
            UserInstance.setEmail(req.body.userEmail);
        }

        UserInstance.destruct();

        Utilities.setHeader(200, 'user(s) updated');
    }
    else {

        Utilities.setHeader(422);
    }

});

router.delete('/', async function(req, res) {



    if (await UserInstance.defineInfoFor(UserInstance.getJWT().id, true) &&
        await UserInstance.checkPassword(req.body.password)) {

        await UserInstance.destroy(UserInstance.getJWT().id);
        Utilities.setHeader(200, 'user deleted');
    }
    else {

        Utilities.setHeader(422);
    }

});

router.post('/', async function(req, res) {

    const data = req.body;

    if (data.username && data.fullName && data.password && data.confirmation && data.email && data.lvl) {

        await UserInstance.create(data.username, data.fullName, data.password, data.confirmation, data.email, data.lvl);
    }
    else {
        Utilities.setHeader(422);
    }
});
module.exports = router