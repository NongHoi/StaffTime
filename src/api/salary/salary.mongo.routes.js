const express = require('express');
const router = express.Router();

module.exports = (io, connectedUsers) => {
    const salaryController = require('./salary.mongo.controller')(io, connectedUsers);

    // Authentication middleware
    const requireAuth = (req, res, next) => {
        if (!req.session.user) {
            return res.status(401).json({ message: 'Chưa đăng nhập' });
        }
        next();
    };

    // Role check middleware for admin/manager
    const requireAdminOrManager = (req, res, next) => {
        if (!req.session.user || (req.session.user.role_id !== 1 && req.session.user.role_id !== 2)) {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }
        next();
    };

    router.use(requireAuth);

    // Routes
    router.post('/parttime', requireAdminOrManager, salaryController.calculatePartTimeSalary);
    router.post('/fulltime', requireAdminOrManager, salaryController.calculateFullTimeSalary);

    return router;
};