// Lấy danh sách các ngày đã chấm công
const getMyAttendanceDates = async (req, res) => {
  try {
    const user_id = req.session.user.id;
    const dates = await attendanceModel.getAttendanceDates(user_id);
    res.json(dates);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy danh sách chấm công theo tháng
const getMyAttendanceByMonth = async (req, res) => {
  try {
    const user_id = req.session.user.id;
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ message: 'Thiếu năm hoặc tháng.' });
    const data = await attendanceModel.getAttendanceByMonth(user_id, year, month);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy danh sách chấm công theo tuần
const getMyAttendanceByWeek = async (req, res) => {
  try {
    const user_id = req.session.user.id;
    const { year, week } = req.query;
    if (!year || !week) return res.status(400).json({ message: 'Thiếu năm hoặc tuần.' });
    const data = await attendanceModel.getAttendanceByWeek(user_id, year, week);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
const attendanceModel = require('../models/attendanceModel');

const checkIn = async (req, res) => {
  try {
    const user_id = req.session.user.id;
    const { check_in, date, type, note } = req.body;
    if (!check_in || !date) return res.status(400).json({ message: 'Thiếu thông tin.' });
    const attendance = await attendanceModel.checkIn({ user_id, check_in, date, type: type || 'normal', note });
    res.json({ message: 'Chấm công in thành công', attendance });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const checkOut = async (req, res) => {
  try {
    const { attendance_id, check_out, note } = req.body;
    if (!attendance_id || !check_out) return res.status(400).json({ message: 'Thiếu thông tin.' });
    const attendance = await attendanceModel.checkOut({ attendance_id, check_out, note });
    res.json({ message: 'Chấm công out thành công', attendance });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const user_id = req.session.user.id;
    const data = await attendanceModel.getAttendanceByUser(user_id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getMyAttendanceByDate = async (req, res) => {
  try {
    const user_id = req.session.user.id;
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Thiếu ngày.' });
    const data = await attendanceModel.getAttendanceByDate(user_id, date);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { checkIn, checkOut, getMyAttendance, getMyAttendanceByDate, getMyAttendanceDates, getMyAttendanceByMonth, getMyAttendanceByWeek };
