const router = require('express').Router();

const db = require("../../controller/classes/db");
const Issue = require("../../controller/classes/Issue");

router.get("/:issueNum?", async function(req, res) {

    const IssueInstance = new Issue();
console.log(req.query.issueNum)

    const previews = await IssueInstance.getPreviews(
      {
        issueNum: req.query.issueNum
      }
    );

    res.send(await previews);
});

module.exports = router;