const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/GroupDepartureController');
const verifyAdmin = require('../../middleware/verifyAdmin');

router.use(verifyAdmin);

router.get('/packages', controller.listPackages.bind(controller));
router.post('/packages/mark', controller.markPackageGroup.bind(controller));
router.get('/', controller.list.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.patch('/:id/seats', controller.adjustSeats.bind(controller));
router.delete('/:id', controller.remove.bind(controller));

module.exports = router;
