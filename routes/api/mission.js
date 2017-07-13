const router = require('express').Router();
const User = require("../../controller/classes/User");
const Article = require("../../controller/classes/Article");
const Utilities = require("../../controller/classes/Utilities");
const fs = require('fs');

router.put('/', function(req, res) {

    const ArticleInstance = new Article();
    const UserInstance = new User();

    const token = UserInstance.getJWT();

    if (!req.body.edit) {
        Utilities.setHeader(422, "missing required field");
        return;
    }

    if (!UserInstance.isLoggedIn() || token.level < 3) {
        Utilities.setHeader(401);
        return;
    }

    const filteredEdit = ArticleInstance.stripTags(req.body.edit);

    fs.writeFile(__dirname+'/../../client/public/missionView.html', filteredEdit, (err) => console.log(err));
    Utilities.setHeader(200, "mission edited");
});

module.exports = router;