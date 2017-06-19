const router = require('express').Router();
const Article = require("../../controller/classes/Article");
const Comment = require("../../controller/classes/Comment");


router.get("/:issueNum?", async function(req, res) {

    const ArticleInstance = new Article();
    const CommentInstance = new Comment();

    await ArticleInstance.defineInfoFor(req.query.issue, req.query.name);

    res.send({
        body: ArticleInstance.getBody(),
        tags: ArticleInstance.listTags(),
        can_edit: ArticleInstance.canEdit(),
        id: ArticleInstance.getId(),
        comments: await CommentInstance.getAllByArticle(req.query.issue, req.query.name)
    });
});

router.put('*', async function(req, res) {

    const ArticleInstance = new Article();
    await ArticleInstance.defineInfoFor(req.body.issue, decodeURIComponent(req.body.name));
    console.log('here');
    ArticleInstance.edit(req.body.edit).then(() => ArticleInstance.destruct());

    res.send();
});

module.exports = router