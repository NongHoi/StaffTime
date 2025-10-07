const express = require('express');
const router = express.Router();

module.exports = (io, connectedUsers) => {
    const attendanceController = require('./attendance.mongo.controller')(io, connectedUsers);

    // Authentication middleware
    const requireAuth = (req, res, next) => {
        if (!req.session.user) {
            return res.status(401).json({ message: 'Chưa đăng nhập' });
        }
        next();
    };

    router.use(requireAuth);

    // Routes
    router.get('/my-by-date', attendanceController.getMyAttendanceByDate);
    router.get('/my-by-month', attendanceController.getMyAttendanceByMonth);
    router.get('/my-by-week', attendanceController.getMyAttendanceByWeek);
    router.get('/fulltime-by-date', attendanceController.getFulltimeAttendanceByDate);
    router.get('/fulltime-by-month', attendanceController.getFulltimeAttendanceByMonth);
    router.get('/fulltime-by-week', attendanceController.getFulltimeAttendanceByWeek);
    router.get('/admin-by-month', attendanceController.getAdminAttendanceByMonth);
    router.get('/my-dates', attendanceController.getMyDates);
    router.post('/checkin', attendanceController.checkIn);
    router.post('/checkout', attendanceController.checkOut);
    router.post('/checkin-show', attendanceController.checkInShow);

    return router;
};