import * as express from 'express';
const router = express.Router();
const User = require("../classes/User");
const Utilities = require("../classes/Utilities");


router.put('*', async function(req, res) {

    const UserInstance = new User();

    if (req.body.authCode) {

        await UserInstance.login(UserInstance.getJWT().email, req.body.password, req.body.authCode);

        if (!res.headersSent) {
            res.end();
        }
        return UserInstance.destruct(); // save email change
    }


    else if (req.body.username && req.body.password) {

        const loginResult = await UserInstance.login(req.body.username, req.body.password);
        UserInstance.destruct();

        return (loginResult) ? res.send(loginResult) : false;
    }

    else if (req.body.logout) {
        UserInstance.logout();
        res.end();
    }
    else {

        return res.send(Utilities.setHeader(422, "missing required field"));
    }

});

router.get('*', function(req, res) {

    const UserInstance = new User();

    res.send(UserInstance.getJWT());
});

export default router