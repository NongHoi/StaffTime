const express = require('express');
const router = express.Router();
const materialReturnController = require('./material-return.mongo');
const requireLogin = require('../../middlewares/requireLogin');

router.use(requireLogin);

// Get all issuance forms for return
router.get('/forms', materialReturnController.getIssuanceFormsForReturn);

// Return materials from a show
router.post('/:formId/return', materialReturnController.returnMaterials);

// Get return history
router.get('/history', materialReturnController.getReturnHistory);

module.exports = router;
