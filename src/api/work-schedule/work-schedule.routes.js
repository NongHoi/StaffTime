const express = require('express');
const router = express.Router();
const workScheduleController = require('./work-schedule.controller');
const requireLogin = require('../../middlewares/requireLogin');
const requireRole = require('../../middlewares/requireRole');

module.exports = (io, connectedUsers) => {
    // Pass io and connectedUsers to the controller
    const controller = workScheduleController(io, connectedUsers);

    // Tạo, sửa, xóa lịch làm: chỉ admin/manager
    router.post('/', requireLogin, requireRole([1, 2]), controller.createWorkSchedule);
    router.put('/:id', requireLogin, requireRole([1, 2]), controller.updateWorkSchedule);
    router.delete('/:id', requireLogin, requireRole([1, 2]), controller.deleteWorkSchedule);

    // Lấy lịch làm theo tháng (mọi user)
    router.get('/month', requireLogin, controller.getWorkSchedulesByMonth);
    // Đăng ký lịch làm (nhân viên)
    router.post('/register', requireLogin, controller.registerWorkSchedule);
    // Lấy lịch làm đã đăng ký của user (phải đặt trước route động)
    router.get('/my-registrations', requireLogin, controller.getSchedulesForUser);
    // Lấy danh sách nhân viên đã đăng ký cho 1 lịch làm
    router.get('/:id/registrations', requireLogin, requireRole([1, 2]), controller.getRegistrationsBySchedule);
    // Lấy chi tiết lịch làm
    router.get('/:id', requireLogin, controller.getWorkScheduleById);

    return router;
};
