const express = require('express');
const router = express.Router();
const workScheduleController = require('../controllers/workScheduleController');
const requireLogin = require('../middlewares/requireLogin');
const requireRole = require('../middlewares/requireRole');

// Tạo, sửa, xóa lịch làm: chỉ admin/manager
router.post('/', requireLogin, requireRole([1,2]), workScheduleController.createWorkSchedule);
router.put('/:id', requireLogin, requireRole([1,2]), workScheduleController.updateWorkSchedule);
router.delete('/:id', requireLogin, requireRole([1,2]), workScheduleController.deleteWorkSchedule);


// Lấy lịch làm theo tháng (mọi user)
router.get('/month', requireLogin, workScheduleController.getWorkSchedulesByMonth);
// Đăng ký lịch làm (nhân viên)
router.post('/register', requireLogin, workScheduleController.registerWorkSchedule);
// Lấy lịch làm đã đăng ký của user (phải đặt trước route động)
router.get('/my-registrations', requireLogin, workScheduleController.getSchedulesForUser);
// Lấy danh sách nhân viên đã đăng ký cho 1 lịch làm
router.get('/:id/registrations', requireLogin, requireRole([1,2]), workScheduleController.getRegistrationsBySchedule);
// Lấy chi tiết lịch làm
router.get('/:id', requireLogin, workScheduleController.getWorkScheduleById);

module.exports = router;
