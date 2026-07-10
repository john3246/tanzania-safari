const express = require('express');
const router = express.Router();
const safariController = require('../../controllers/safariController');

router.get('/',         safariController.getAllPackages);
router.get('/featured', safariController.getFeaturedPackages);
router.get('/:slug',    safariController.getPackageBySlug);

module.exports = router;
