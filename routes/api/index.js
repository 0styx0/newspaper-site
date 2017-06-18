var router = require('express').Router();
const previews = require('./previews');
const story = require('./story');

// split up route handling
router.use('/previews', previews);
router.use('/story', story);

module.exports = router;