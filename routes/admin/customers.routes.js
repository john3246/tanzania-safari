const express = require('express');
const router = express.Router();
const CustomerController = require('../../controllers/admin/CustomerController');
const verifyAdmin = require('../../middleware/verifyAdmin');

router.use(verifyAdmin);
router.get('/', CustomerController.list);

module.exports = router;
