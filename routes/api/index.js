var router = require('express').Router();

// split up route handling
router.use('/previews', require('./previews'));

module.exports = router;