import * as express from 'express';
const router = express.Router();
const Issue = require("../classes/Issue");

router.get("/:issueNum?", async function(req, res) {

    const IssueInstance = new Issue();

    const previews = await IssueInstance.getPreviews(
      {
        issueNum: req.query.issueNum
      }
    );

    res.send(await previews);
});

module.exports = router;