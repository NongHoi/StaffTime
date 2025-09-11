const express = require('express');
const router = express.Router();
const configController = require('./config.controller');
const requireLogin = require('../../middlewares/requireLogin');
const requireRole = require('../../middlewares/requireRole');

// Chỉ admin và manager được cấu hình
router.use(requireLogin, requireRole([1, 2]));

router.get('/', configController.getNightShiftTime);
router.post('/', configController.setNightShiftTime);

module.exports = router;
