const router = require('express').Router();
const Utilities = require('../../controller/classes/Utilities');
const Comment = require('../../controller/classes/Comment');

router.get('*', async function(req, res) {

    const data = req.query;

    if (data.issue && data.url) {

console.log("PPPPPPPPPPPPP")
        const CommentInstance = new Comment();
        const comments = await CommentInstance.getAllByArticle(data.issue, data.url);
        console.log(comments);
        res.send(comments);
    }
    else {
        Utilities.setHeader(422);
    }
});



module.exports = router;