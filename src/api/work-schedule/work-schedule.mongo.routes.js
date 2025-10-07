const express = require('express');
const router = express.Router();

module.exports = (io, connectedUsers) => {
    // Use the legacy controller that has full CRUD functionality
    const workScheduleController = require('./work-schedule-legacy.controller')(io, connectedUsers);

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

    // Routes for viewing schedules (all users)
    router.get('/month', workScheduleController.getMonthSchedules);
    router.get('/my-registrations', workScheduleController.getMyRegistrations);
    router.get('/:id/registrations', workScheduleController.getRegistrations);

    // Routes for employee registration
    router.post('/register', workScheduleController.registerSchedule);

    // CRUD routes for admin/manager only
    router.post('/', requireAdminOrManager, workScheduleController.createSchedule);
    router.put('/:id', requireAdminOrManager, workScheduleController.updateSchedule);
    router.delete('/:id', requireAdminOrManager, workScheduleController.deleteSchedule);

    return router;
};