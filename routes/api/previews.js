const router = require('express').Router();

const db = require("../../controller/classes/db");
const Issue = require("../../controller/classes/Issue");

router.all("/", async function(req, res, next) {

    const IssueInstance = new Issue();

    const previews = await IssueInstance.getPreviews(
      {
        issueNum: 1
      }
    );


    res.send(await previews);



});

module.exports = router;