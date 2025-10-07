const express = require('express');
const router = express.Router();
const workScheduleController = require('./work-schedule-legacy.controller');
const requireLogin = require('../../middlewares/requireLogin');
const requireRole = require('../../middlewares/requireRole');

module.exports = (io, connectedUsers) => {
    // Pass io and connectedUsers to the controller
    const controller = workScheduleController(io, connectedUsers);

    // Tạo, sửa, xóa lịch làm: chỉ admin/manager
    router.post('/', requireLogin, requireRole([1, 2]), controller.createSchedule);
    router.put('/:id', requireLogin, requireRole([1, 2]), controller.updateSchedule);
    router.delete('/:id', requireLogin, requireRole([1, 2]), controller.deleteSchedule);

    // Lấy lịch làm theo tháng (mọi user)
    router.get('/month', requireLogin, controller.getMonthSchedules);
    // Đăng ký lịch làm (nhân viên)
    router.post('/register', requireLogin, controller.registerSchedule);
    // Lấy lịch làm đã đăng ký của user (phải đặt trước route động)
    router.get('/my-registrations', requireLogin, controller.getMyRegistrations);
    // Lấy danh sách nhân viên đã đăng ký cho 1 lịch làm
    router.get('/:id/registrations', requireLogin, requireRole([1, 2]), controller.getRegistrations);

    return router;
};
