const router = require('express').Router();
const Utilities = require('../classes/Utilities');
const Comment = require('../classes/Comment');

const CommentInstance = new Comment();


router.get('*', async function(req, res) {

    const data = req.query;

    if (data.issue && data.url) {

        const comments = await CommentInstance.getAllByArticle(data.issue, data.url);

        if (!res.headersSent) {
            res.send(comments);
        }
    }
    else {
        Utilities.setHeader(422);
    }
});


router.delete('*', async function(req, res) {

    if (req.body.id && await CommentInstance.defineInfo(req.body.id)) {

        const result = await CommentInstance.delete();

        if (!res.headersSent) {
            res.send(result);
        }
    }
    else {
        Utilities.setHeader(422);
    }
});

router.post('*', async function(req, res) {

    const data = req.body;

    if (data.issue && data.url && data.content) {

        const result = await CommentInstance.create(data.issue, data.url, data.content);

        if (!res.headersSent) {
            res.send(result);
        }
    }
    else {
        Utilities.setHeader(422);
    }
});

module.exports = router;