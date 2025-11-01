const express = require('express');
const router = express.Router();

module.exports = (io, connectedUsers) => {
    const configController = require('./config.mongo')(io, connectedUsers);

    // Authentication middleware
    const requireAuth = (req, res, next) => {
        if (!req.session.user) {
            return res.status(401).json({ message: 'Chưa đăng nhập' });
        }
        next();
    };

    // Role check middleware for admin only
    const requireAdmin = (req, res, next) => {
        if (!req.session.user || req.session.user.role_id !== 1) {
            return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
        }
        next();
    };

    router.use(requireAuth);

    // Routes
    router.get('/', configController.getConfig);
    router.post('/', requireAdmin, configController.updateConfig);

    return router;
};