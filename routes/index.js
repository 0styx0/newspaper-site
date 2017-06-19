const express = require('express');
const router = express.Router();
const jwt = require('jwt-simple');
const Utilities = require('../controller/classes/Utilities');
const JWT = require('../config.json').JWT;


// so can do stuff with cookies later
router.use(function (req, res, next) {

    Utilities.req = req;
    Utilities.res = res;
    next();
});


function getJWT(req) {

  const cookie = req.cookies.jwt;
  return (cookie) ? jwt.decode(req.cookies.jwt, JWT.SECRET)[1] : {};
}

function serve(page, title) {

  Utilities.res.render('template', {page: page+'.html', title: title, jwt: getJWT(Utilities.req)});
}

/* home page. */
const sendMainPage = () => serve('mainPage', 'Storm News')
router.get('/', sendMainPage);
router.get('/issue/[0-9]+?', sendMainPage);
router.get('/tag/[a-zA-Z]+', sendMainPage);



router.get(/issue\/\d+?\/story\/.+/, (req) => serve('story', decodeURIComponent(req.path.split('/')[4])));

router.get('/login', () => serve('stormLogin', 'Login'));

router.get('/publish', () => serve('publishForm', 'Publish'));

module.exports = router;
