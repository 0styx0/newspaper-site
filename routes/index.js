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

function serve(page, title, description) {

  Utilities.res.render('template', {
    page: page+'.html',
    title: title,
    description: description,
    jwt: getJWT(Utilities.req)});
}


/* home page. */
router.get(/^(\/|\/issue\/\d+?|\/tag\/\w+)$/, () => serve('mainPage', 'Storm News', 'Latest from TABC Eye of the Storm'));

router.get(/issue\/\d+?\/story\/.+/, (req) => {
  const storyName = decodeURIComponent(req.path.split('/')[4]);
  serve('story', storyName, `Story about ${storyName}`)
});

router.get('/login', () => serve('stormLogin', 'Login', 'Login Screen for TABCEOTS'));

router.get('/publish', () => serve('publishForm', 'Publish', 'Publish Stories'));

router.get('/mission', () => serve('missionView', 'Mission', 'Mission of TABC Eye of The Storm'));

router.get('/issue', () => serve('issueTable', 'Issues', 'Past issues of Eye Of The Storm'));

router.get('/u', () => serve('journalistTable', 'Journalists', 'Information about users\' accounts'));

router.get('/signup', () => serve('signupForm', 'Sign Up', 'Signup Screen'));

router.get(/^\/u\/\w+$/, () => serve('settingsTable', 'Profile', 'Torah Academy Of Bergen County\'s Eye Of the Storm user profile'));

router.get('/modifyArticles', () => serve('articleTable', 'Modify Articles', 'Admins can rollback and push changes to news articles'));

router.get('/authLogin', () => serve('authForm', 'Two Factor Authentication', '2 Factor Authentication", "Submit 2FA for login security'))

router.get('/forgotPass', () => serve('forgotPasswd', 'Recover Account', 'Recover account in event of lost password'))

module.exports = router;
