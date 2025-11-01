const express = require('express');
const router = express.Router();
const materialController = require('./material');
const requireLogin = require('../../middlewares/requireLogin');
const requireRole = require('../../middlewares/requireRole');

// All routes require login and manager/admin role
router.use(requireLogin);
router.use(requireRole([1, 2])); // Admin or Manager

// GET /api/materials - Get all materials
router.get('/', materialController.getAllMaterials);

// GET /api/materials/:id - Get material by ID
router.get('/:id', materialController.getMaterialById);

// POST /api/materials - Create new material
router.post('/', materialController.createMaterial);

// PUT /api/materials/:id - Update material
router.put('/:id', materialController.updateMaterial);

// DELETE /api/materials/:id - Delete material
router.delete('/:id', materialController.deleteMaterial);

module.exports = router;