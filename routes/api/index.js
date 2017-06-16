var router = require('express').Router();
const previews = require('./previews')
// split up route handling
router.use('/previews', previews);

module.exports = router;