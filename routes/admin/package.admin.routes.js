const express = require('express');
const router = express.Router();
const packageAdminController = require('../../controllers/admin/package.admin.controller');
const { verifyAdmin } = require('../../middleware/auth.middleware');

router.use(verifyAdmin);

router.get('/',      packageAdminController.getAll);
router.post('/',     packageAdminController.create);
router.put('/:id',   packageAdminController.update);
router.delete('/:id', packageAdminController.delete);

router.get('/:id/itinerary', packageAdminController.getItinerary);
router.post('/:id/itinerary', packageAdminController.saveItinerary);
router.get('/:id/destinations', packageAdminController.getDestinations);
router.post('/:id/destinations', packageAdminController.saveDestinations);

module.exports = router;
