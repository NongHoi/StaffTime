// Lấy danh sách các ngày đã chấm công của user
const getAttendanceDates = async (user_id) => {
  const result = await pool.query(
    `SELECT DISTINCT date FROM attendance WHERE user_id = $1 ORDER BY date DESC`,
    [user_id]
  );
  return result.rows.map(r => r.date);
};

// Lấy danh sách chấm công theo tháng
const getAttendanceByMonth = async (user_id, year, month) => {
  const result = await pool.query(
    `SELECT * FROM attendance WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2 AND EXTRACT(MONTH FROM date) = $3 ORDER BY date DESC, check_in DESC`,
    [user_id, year, month]
  );
  return result.rows;
};

// Lấy danh sách chấm công theo tuần
const getAttendanceByWeek = async (user_id, year, week) => {
  const result = await pool.query(
    `SELECT * FROM attendance WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2 AND EXTRACT(WEEK FROM date) = $3 ORDER BY date DESC, check_in DESC`,
    [user_id, year, week]
  );
  return result.rows;
};
const pool = require('../config/db');


const checkIn = async ({ user_id, check_in, date, type, note }) => {
  const result = await pool.query(
    `INSERT INTO attendance (user_id, check_in, date, type, note) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [user_id, check_in, date, type, note || null]
  );
  return result.rows[0];
};

const checkOut = async ({ attendance_id, check_out, note }) => {
  const result = await pool.query(
    `UPDATE attendance SET check_out = $1${note !== undefined ? ', note = $3' : ''} WHERE id = $2 RETURNING *`,
    note !== undefined ? [check_out, attendance_id, note] : [check_out, attendance_id]
  );
  return result.rows[0];
};

const getAttendanceByUser = async (user_id) => {
  const result = await pool.query(
    `SELECT * FROM attendance WHERE user_id = $1 ORDER BY date DESC, check_in DESC`,
    [user_id]
  );
  return result.rows;
};

const getAttendanceByDate = async (user_id, date) => {
  const result = await pool.query(
    `SELECT * FROM attendance WHERE user_id = $1 AND date = $2 ORDER BY check_in`,
    [user_id, date]
  );
  return result.rows;
};

module.exports = { checkIn, checkOut, getAttendanceByUser, getAttendanceByDate, getAttendanceDates, getAttendanceByMonth, getAttendanceByWeek };
