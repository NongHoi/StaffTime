const express = require('express');
const router = express.Router();
const attendanceController = require('./attendance.controller');
const requireLogin = require('../../middlewares/requireLogin');

router.use(requireLogin);

// Chấm công in
router.post('/checkin', attendanceController.checkIn);
// Chấm công out
router.post('/checkout', attendanceController.checkOut);
// Lấy lịch sử chấm công của chính mình
router.get('/my', attendanceController.getMyAttendance);
// Lấy lịch sử chấm công theo ngày
router.get('/my-by-date', attendanceController.getMyAttendanceByDate);
// Lấy danh sách các ngày đã chấm công
router.get('/my-dates', attendanceController.getMyAttendanceDates);
// Lấy danh sách chấm công theo tháng
router.get('/my-by-month', attendanceController.getMyAttendanceByMonth);
// Lấy danh sách chấm công theo tuần
router.get('/my-by-week', attendanceController.getMyAttendanceByWeek);
// Chấm công show cho fulltime
router.post('/checkin-show', attendanceController.checkInShow);
// Lấy lịch sử chấm công fulltime
router.get('/fulltime-by-date', attendanceController.getFulltimeAttendanceByDate);
router.get('/fulltime-by-month', attendanceController.getFulltimeAttendanceByMonth);
router.get('/fulltime-by-week', attendanceController.getFulltimeAttendanceByWeek);

module.exports = router;
