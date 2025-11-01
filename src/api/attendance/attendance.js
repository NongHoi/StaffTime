const pool = require('../../config/db');
const attendanceModel = require('./attendance.model');
const fulltimeAttendanceModel = require('./fulltimeAttendance.model');

// Lấy lịch sử chấm công fulltime theo ngày
const getFulltimeAttendanceByDate = async (req, res) => {
  try {
    const user_id = req.session.user.id;
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Thiếu ngày.' });
    const result = await pool.query('SELECT * FROM fulltime_attendance WHERE user_id = $1 AND date = $2 ORDER BY date DESC', [user_id, date]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Lỗi server' });
  }
};

// Lấy lịch sử chấm công fulltime theo tháng
const getFulltimeAttendanceByMonth = async (req, res) => {
  try {
    const user_id = req.session.user.id;
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ message: 'Thiếu năm hoặc tháng.' });
    const result = await pool.query('SELECT * FROM fulltime_attendance WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2 AND EXTRACT(MONTH FROM date) = $3 ORDER BY date DESC', [user_id, year, month]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Lỗi server' });
  }
};

// Lấy lịch sử chấm công fulltime theo tuần
const getFulltimeAttendanceByWeek = async (req, res) => {
  try {
    const user_id = req.session.user.id;
    const { year, week } = req.query;
    if (!year || !week) return res.status(400).json({ message: 'Thiếu năm hoặc tuần.' });
    const result = await pool.query(`SELECT *, EXTRACT(WEEK FROM date) as week_num FROM fulltime_attendance WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2 AND EXTRACT(WEEK FROM date) = $3 ORDER BY date DESC`, [user_id, year, week]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Lỗi server' });
  }
};

// Chấm công show cho fulltime
const checkInShow = async (req, res) => {
  try {
    const user_id = req.session.user.id;
    const { date, note } = req.body;
    if (!date) return res.status(400).json({ message: 'Thiếu ngày.' });
    const attendance = await fulltimeAttendanceModel.checkInShow({ user_id, date, note });
    res.json({ message: 'Chấm công show thành công', attendance });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Lỗi server' });
  }
};
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

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getMyAttendanceByDate,
  getMyAttendanceDates,
  getMyAttendanceByMonth,
  getMyAttendanceByWeek,
  checkInShow,
  getFulltimeAttendanceByDate,
  getFulltimeAttendanceByMonth,
  getFulltimeAttendanceByWeek
};
