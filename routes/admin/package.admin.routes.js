const express = require('express');
const router = express.Router();
const tourController = require('../../controllers/admin/TourController');
const authenticate = require('../../middleware/verifyAdmin');
const { requirePermission } = require('../../middleware/rbacMiddleware');

router.use(authenticate);

router.get('/',      tourController.getAll);
router.post('/',     requirePermission('tour.create'), tourController.create);
router.put('/:id',   requirePermission('tour.publish'), tourController.update);
router.delete('/:id', requirePermission('tour.publish'), tourController.delete);

router.get('/:id/itinerary', tourController.getItinerary);
router.post('/:id/itinerary', requirePermission('tour.publish'), tourController.saveItinerary);
router.get('/:id/destinations', tourController.getDestinations);
router.post('/:id/destinations', requirePermission('tour.publish'), tourController.saveDestinations);

module.exports = router;
