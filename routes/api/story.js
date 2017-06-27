const router = require('express').Router();
const Article = require("../../controller/classes/Article");
const Comment = require("../../controller/classes/Comment");
const Utilities = require("../../controller/classes/Utilities");


router.get("/:issueNum?", async function(req, res) {

    const ArticleInstance = new Article();
    const CommentInstance = new Comment();

    await ArticleInstance.defineInfoFor(req.query.issue, req.query.name);

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

    res.send(await ArticleInstance.create(data.name, data.txtArea, data['type[]']));

});
module.exports = router