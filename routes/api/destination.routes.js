const express = require('express');
const router = express.Router();
const safariController = require('../../controllers/safariController');

router.get('/',      safariController.getDestinations);
router.get('/:slug', safariController.getDestinationBySlug);

module.exports = router;
