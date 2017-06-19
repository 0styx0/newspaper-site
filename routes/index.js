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
});

const jwt = require('jwt-simple');
const JWT = require('../config.json').JWT;

function getJWT(req) {
  const cookie = req.cookies.jwt;

  return (cookie) ? jwt.decode(req.cookies.jwt, JWT.SECRET)[1] : {};
}

function sendMainPage(req, res, next) {
  res.render('template', {title: "Storm News", page: 'mainPage.html', jwt: getJWT(req)});
};

router.get(/issue\/\d+?\/story\/.+/, (req, res) => res.render('template', {
  title: decodeURIComponent(req.path.split('/')[4]), page: 'story.html', jwt: getJWT(req)
}));

router.get('/login', (req, res) => res.render('template', {title: 'Login', page: 'stormLogin.html', jwt: getJWT(req)}));


router.get('/publish', (req, res) => res.render('template', {title: 'Publish', page: 'publishForm.html', jwt: getJWT(req)}));

module.exports = router;
