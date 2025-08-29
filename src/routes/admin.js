
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const requireLogin = require('../middlewares/requireLogin');
const requireRole = require('../middlewares/requireRole');
const attendanceModel = require('../models/attendanceModel');

// Lấy ngày công theo tháng cho user bất kỳ (admin/manager)
router.get('/attendance-by-month', async (req, res) => {
	try {
		const { user_id, year, month } = req.query;
		if (!user_id || !year || !month) return res.status(400).json({ message: 'Thiếu thông tin.' });
		const data = await attendanceModel.getAttendanceByMonth(user_id, year, month);
		res.json(data);
	} catch (err) {
		res.status(500).json({ message: 'Lỗi server', error: err.message });
	}
});

// Chỉ admin và manager mới được truy cập
router.use(requireLogin, requireRole([1, 2]));

router.get('/users', adminController.getUsers);
router.post('/change-role', adminController.changeRole);
router.post('/change-type', adminController.changeType);

router.post('/set-salary', adminController.setSalary);
router.post('/remove-user', adminController.removeUser);

module.exports = router;
