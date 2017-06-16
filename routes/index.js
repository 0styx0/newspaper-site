var express = require('express');
var router = express.Router();


/* home page. */
router.all('/', sendMainPage);
router.all('/issue/[0-9]+?', sendMainPage);
router.all('/tag/[a-zA-Z]+', sendMainPage);

function sendMainPage(req, res, next) {
  res.render('mainPage', {title: "Storm News"});
};

module.exports = router;
