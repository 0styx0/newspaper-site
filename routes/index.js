var express = require('express');
var router = express.Router();


/* home page. */
router.all('/', sendMainPage);
router.all('/issue/[0-9]+?', sendMainPage);
router.all('/tag/[a-zA-Z]+', sendMainPage);
router.use(function (req, res, next) {
const Utilities = require('../controller/classes/Utilities');

    Utilities.req = req;
    Utilities.res = res;
    next();
})
function sendMainPage(req, res, next) {
  res.render('mainPage', {title: "Storm News"});
};

router.get(/issue\/\d+?\/story\/.+/, (req, res) => res.render('story', {
  title: decodeURIComponent(req.path.split('/')[4])
}));

router.get('/login', (req, res) => res.render('stormLogin', {title: 'Login'}));

module.exports = router;
