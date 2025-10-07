const express = require('express');
const router = express.Router();

module.exports = (io, connectedUsers) => {
    const workScheduleController = require('./work-schedule.mongo.controller')(io, connectedUsers);

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
    router.get('/month', workScheduleController.getMonthSchedule);
    router.get('/my-registrations', workScheduleController.getMyRegistrations);
    router.post('/register', workScheduleController.registerWorkSchedule);
    router.put('/:id/status', requireAdminOrManager, workScheduleController.updateScheduleStatus);

    return router;
};