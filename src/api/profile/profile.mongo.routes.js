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

    // Test route (no auth required)
    router.get('/test', (req, res) => {
        res.json({ message: 'Profile routes working', timestamp: new Date() });
    });

    // Routes
    router.get('/', profileController.getProfile);
    router.post('/update', profileController.updateProfile);
    router.put('/update', profileController.updateProfile);

    return router;
};