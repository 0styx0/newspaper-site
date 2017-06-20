const router = require('express').Router();
const Info = require("../../controller/classes/Info");
const Issue = require("../../controller/classes/Issue");
const User = require("../../controller/classes/User");
const Utilities = require("../../controller/classes/Utilities");

router.get("/", async function(req, res) {

    const InfoInstance = new Info();

    res.send(await InfoInstance.getIssues());
});

router.put('/', async function(req, res) {

    const IssueInstance = new Issue();
    const UserInstance = new User();

    const data = req.body;


    if (!await IssueInstance.defineInfoFor(data.issue) || !await UserInstance.defineInfoFor(UserInstance.getJWT().id, true) ||
!await UserInstance.checkPassword(data.password)) {
        Utilities.setHeader(401);
        return false;
    }


    if (data.issueName) {
        IssueInstance.setName(data.issueName);
    }

    if (data.pub) {
        IssueInstance.setPublic(data.pub);
    }

    IssueInstance.destruct();

});

module.exports = router;