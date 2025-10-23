const express = require('express');
const router = express.Router();
const materialIssuanceController = require('./materialIssuance.controller');
const requireLogin = require('../../middlewares/requireLogin');
const requireRole = require('../../middlewares/requireRole');

// All routes require login and manager/admin role
router.use(requireLogin);
router.use(requireRole([1, 2])); // Admin or Manager

// GET /api/material-issuances - Get all material issuances
router.get('/', materialIssuanceController.getAllMaterialIssuances);

// GET /api/material-issuances/work-schedule/:workScheduleId - Get issuances by work schedule
router.get('/work-schedule/:workScheduleId', materialIssuanceController.getIssuancesByWorkSchedule);

// POST /api/material-issuances - Create new material issuance
router.post('/', materialIssuanceController.createMaterialIssuance);

// PUT /api/material-issuances/:id - Update material issuance
router.put('/:id', materialIssuanceController.updateMaterialIssuance);

// DELETE /api/material-issuances/:id - Delete material issuance
router.delete('/:id', materialIssuanceController.deleteMaterialIssuance);

module.exports = router;