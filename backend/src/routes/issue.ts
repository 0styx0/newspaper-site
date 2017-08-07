import * as express from 'express';
const router = express.Router();
const Info = require("../classes/Info");
const Issue = require("../classes/Issue");
const User = require("../classes/User");
const Utilities = require("../classes/Utilities");

router.get("/", async function(req, res) {

    const InfoInstance = new Info();

    res.send(await InfoInstance.getIssues());
});

router.put('/', async function(req, res) {

    const IssueInstance = new Issue();
    const UserInstance = new User();

    const data = req.body;

    const token = UserInstance.getJWT();

    if (!await IssueInstance.defineInfoFor(data.issue) ||
        !await UserInstance.defineInfoFor(token.id, true) ||
        !await UserInstance.checkPassword(data.password) ||
        token.level < 3) {
        Utilities.setHeader(401);
        return false;
    }


    if (data.issueName) {
        IssueInstance.setName(data.issueName);
    }

    if (data.pub) {
        IssueInstance.setPublic(data.pub);
    }

    IssueInstance.destruct().then(() => Utilities.setHeader(200, "issue updated"));
});

module.exports = router;