const router = require('express').Router();
const Info = require("../../controller/classes/Info");

const ArticleGroup = require('../../controller/classes/ArticleGroup');

router.get("/", async function(req, res) {

    const ArticleGroupInstance = new ArticleGroup();

    res.send(await ArticleGroupInstance.getPageInfo(req.query.articlesFor));
});

module.exports = router;