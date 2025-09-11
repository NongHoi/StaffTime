const express = require('express');
const router = express.Router();
const requireLogin = require('../../middlewares/requireLogin');
const profileController = require('./profile.controller');


router.use(requireLogin);
router.get('/', profileController.getProfile);
router.post('/update', profileController.updateProfile);

module.exports = router;
