const express = require('express');
const router = express.Router();
const jwt = require('jwt-simple');
const Utilities = require('../controller/classes/Utilities');
const JWT = require('../config.json').JWT;


// so can do stuff with cookies later
router.use(function (req, res, next) {

    Utilities.req = req;
    Utilities.res = res;

    const jwt = getJWT(req);

    const needToBeLoggedInFor = {
      '/modifyArticles': 3,
      '/publish': 1
    };

    if (needToBeLoggedInFor[req.url] && (!jwt.level || jwt.level < needToBeLoggedInFor[req.url])) {
      return Utilities.setHeader(401);
    }

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
router.get(/^(\/|\/issue\/\d+?|\/tag\/\w+)$/, () => serve('mainPage', 'Storm News'));

router.get(/issue\/\d+?\/story\/.+/, (req) => serve('story', decodeURIComponent(req.path.split('/')[4])));

router.get('/login', () => serve('stormLogin', 'Login'));

router.get('/publish', () => serve('publishForm', 'Publish'));

router.get('/mission', () => serve('missionView', 'Mission'));

router.get('/issue', () => serve('issueTable', 'Issues'));

router.get('/u', () => serve('journalistTable', 'Journalists'));

router.get('/signup', () => serve('signupForm', 'Sign Up'));

router.get(/^\/u\/\w+$/, () => serve('settingsTable', 'Profile'));

router.get('/modifyArticles', () => serve('articleTable', 'Modify Articles'));

router.get('/authLogin', () => serve('authForm', 'Two Factor Authentication'))

module.exports = router;
