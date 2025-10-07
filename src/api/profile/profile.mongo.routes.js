const express = require('express');
const router = express.Router();

module.exports = (io, connectedUsers) => {
    const profileController = require('./profile.mongo.controller')(io, connectedUsers);

    // Authentication middleware
    const requireAuth = (req, res, next) => {
        if (!req.session.user) {
            return res.status(401).json({ message: 'Chưa đăng nhập' });
        }
        next();
    };

    router.use(requireAuth);

    // Routes
    router.get('/', profileController.getProfile);
    router.put('/update', profileController.updateProfile);

    return router;
};