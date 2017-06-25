const router = require('express').Router();
const Info = require("../../controller/classes/Info");
const Utilities = require('../../controller/classes/Utilities');
const User = require('../../controller/classes/User');
const ArticleGroup = require('../../controller/classes/ArticleGroup');

router.get('/', async function(req, res) {

    const ArticleGroupInstance = new ArticleGroup();

    const pageInfo = await ArticleGroupInstance.getPageInfo(req.query.articlesFor);

    return (await pageInfo) ? res.send(await pageInfo) : false;
});

router.put('/', async function(req, res) {


    const ArticleGroupInstance = new ArticleGroup();
    const UserInstance = new User();
    const token = UserInstance.getJWT();
    const data = req.body;

    await UserInstance.defineInfoFor(token.id, true);

    if (!data['artId[]']) {
        Utilities.setHeader(422, "missing required field");
        return false;
    }
    if (!UserInstance.isLoggedIn() || !await UserInstance.checkPassword(data.password) || UserInstance.getJWT().level < 3) {

        Utilities.setHeader(401);
        return false;
    }

    for (let i = 0; i < data["artId[]"].length; i++) {

        if (data['tag[]'] && !await ArticleGroupInstance.setMultiTags(data["artId[]"][i], data["tag[]"][i], data["password"], UserInstance)) {
            return false;
        }

        if (data["order[]"] !== undefined && !await ArticleGroupInstance.setDisplay(data["artId[]"][i], data["order[]"][i])) {

            Utilities.setHeader(422, "missing required field");
            return false;
        }
    }

    return Utilities.setHeader(200, "article(s) updated");
});

router.delete('/', async function(req, res) {

    const ArticleGroupInstance = new ArticleGroup();
    const UserInstance = new User();
    await UserInstance.defineInfoFor(UserInstance.getJWT().id, true);

    if (await ArticleGroupInstance.delete(req.body['delArt[]'], req.body.password, UserInstance)) {
        return Utilities.setHeader(200, "article(s) updated");
    }
    else {
        return Utilities.setHeader(401);
    }
});

module.exports = router;