const express = require('express');
const router = express.Router();

router.all("/", function(req, res, next) {
    res.render("mainPage", {title: "other"});
});

module.exports = router;