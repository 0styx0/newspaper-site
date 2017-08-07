import * as express from 'express';
const router = express.Router();
const Article = require("../classes/Article");
const Comment = require("../classes/Comment");
const Utilities = require("../classes/Utilities");
const User = require("../classes/User");


router.get("/:issueNum?", async function(req, res) {

    const ArticleInstance = new Article();
    const CommentInstance = new Comment();

    if (!await ArticleInstance.defineInfoFor(req.query.issue, req.query.name)) {
        return;
    }

    const body = ArticleInstance.getBody(),
    tags = ArticleInstance.listTags(),
    can_edit = ArticleInstance.canEdit(),
    id = ArticleInstance.getId(),
    comments = await CommentInstance.getAllByArticle(req.query.issue, req.query.name)

    if (!res.headersSent) {

        res.send({
            body,
            tags,
            comments,
            id,
            can_edit
        });
    }
});

router.put('*', async function(req, res) {

    const ArticleInstance = new Article();
    await ArticleInstance.defineInfoFor(req.body.issue, decodeURIComponent(req.body.name));

    await ArticleInstance.edit(req.body.edit).then(() => ArticleInstance.destruct());

    res.end();
});

router.post('*', async function(req, res) {

    const data = req.body;

    if (!(data.name && data.txtArea && data['type[]'])) {

        Utilities.setHeader(422, 'missing required field');
        return;
    }

    const ArticleInstance = new Article();

    const createResult = await ArticleInstance.create(data.name, data.txtArea, data['type[]']);

    if (!res.headersSent) {
        res.send(await createResult);
    }

});

router.delete('*', async function(req, res) {

    const data = req.body;
    const UserInstance = new User();
    const ArticleInstance = new Article();


    if (!(data.name && data.issue && data.password) ||
        !await UserInstance.defineInfoFor(UserInstance.getJWT().id, true) ||
        !await UserInstance.checkPassword(data.password)) {

        return Utilities.setHeader(422, 'missing required field');
    }
    else {

        await ArticleInstance.defineInfoFor(data.issue, data.name);
        ArticleInstance.destroy();
    }
});
module.exports = router