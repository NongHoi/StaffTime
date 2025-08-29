const pool = require('../config/db');

// Lấy giờ ca đêm mới nhất
const getNightShiftTime = async () => {
  const result = await pool.query('SELECT night_shift_start, night_shift_end FROM night_shift_time ORDER BY id DESC LIMIT 1');
  return result.rows[0];
};

// Lưu giờ ca đêm mới
const setNightShiftTime = async ({ night_shift_start, night_shift_end }) => {
  const result = await pool.query(
    `INSERT INTO night_shift_time (night_shift_start, night_shift_end) VALUES ($1, $2) RETURNING night_shift_start, night_shift_end, created_at`,
    [night_shift_start, night_shift_end]
  );
  return result.rows[0];
};

module.exports = { getNightShiftTime, setNightShiftTime };
