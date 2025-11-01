const express = require('express');
const router = express.Router();
const controller = require('./materialIssuanceForm');
const requireLogin = require('../../middlewares/requireLogin');
const requireRole = require('../../middlewares/requireRole');

router.use(requireLogin);
router.use(requireRole([1,2]));

router.post('/', controller.createIssuanceForm);
router.get('/', controller.getForms);
router.get('/:id', controller.getFormById);
router.get('/:id/export/excel', controller.exportFormToExcel);

module.exports = router;