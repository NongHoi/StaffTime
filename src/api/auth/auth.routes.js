const express = require('express');
const router = express.Router();
const authController = require('./auth');


router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authController.me);
router.post('/logout', authController.logout);

module.exports = router;
