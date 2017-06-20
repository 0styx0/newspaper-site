const router = require('express').Router();
const Info = require("../../controller/classes/Info");

const ArticleGroup = require('../../controller/classes/ArticleGroup');

router.get('/', async function(req, res) {

    const ArticleGroupInstance = new ArticleGroup();

    res.send(await ArticleGroupInstance.getPageInfo(req.query.articlesFor));
});

router.put('/', function(req, res) {


    const ArticleGroupInstance = new ArticleGroup();
    const data = req.body;

    for (let i = 0; i < data["artId[]"].length; i++) {

        ArticleGroupInstance.setMultiTags(data["artId[]"][i], data["tag[]"][i], data["password"]);

        if (data["order[]"] !== undefined) {

            ArticleGroupInstance.setDisplay(data["artId[]"][i], data["order[]"][i]);
        }
    }


    return true;
});
module.exports = router;