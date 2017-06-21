const router = require('express').Router();
const Utilities = require('../../controller/classes/Utilities');


// for jwt getting and setting
router.use(function (req, res, next) {

    Utilities.req = req;
    Utilities.res = res;
    next();
});

// split up route handling
router.use('/previews', require('./previews'));
router.use('/story', require('./story'));
router.use('/userStatus', require('./userStatus'));
router.use('/issue', require('./issue'));
router.use('/userGroup', require('./userGroup'));
router.use('/articleGroup', require('./articleGroup'));
router.use('/mission', require('./mission'));

module.exports = router;