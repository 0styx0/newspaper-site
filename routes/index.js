var express = require('express');
var router = express.Router();


/* home page. */
router.all('/', function(req, res, next) {
  res.render('mainPage', {title: "Storm News"});
});

module.exports = router;
