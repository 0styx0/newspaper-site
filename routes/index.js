var express = require('express');
var router = express.Router();

const Utilities = require('../controller/classes/Utilities');

/* home page. */
router.all('/', sendMainPage);
router.all('/issue/[0-9]+?', sendMainPage);
router.all('/tag/[a-zA-Z]+', sendMainPage);

router.use(function (req, res, next) {

    Utilities.req = req;
    Utilities.res = res;
    next();
})
function sendMainPage(req, res, next) {
  res.render('template', {title: "Storm News", page: 'mainPage.html'});
};

router.get(/issue\/\d+?\/story\/.+/, (req, res) => res.render('template', {
  title: decodeURIComponent(req.path.split('/')[4]), page: 'story.html'
}));

router.get('/login', (req, res) => res.render('template', {title: 'Login', page: 'stormLogin.html'}));


router.get('/publish', (req, res) => res.render('template', {title: 'Publish', page: 'publishForm.html'}));

module.exports = router;
