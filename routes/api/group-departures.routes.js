const express = require('express');
const router = express.Router();
const controller = require('../../controllers/groupSafari.controller');

router.get('/', controller.listDepartures.bind(controller));
router.get('/:slug', controller.getDeparture.bind(controller));
router.post('/:slug/request', controller.requestTrip.bind(controller));

module.exports = router;
