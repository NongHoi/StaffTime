const pool = require('../../config/db');

// Lưu chấm công show cho fulltime
async function checkInShow({ user_id, date, note }) {
  // Kiểm tra đã chấm công ngày này chưa
  const existed = await pool.query('SELECT id FROM fulltime_attendance WHERE user_id = $1 AND date = $2', [user_id, date]);
  if (existed.rows.length > 0) throw new Error('Đã chấm công ngày này!');
  const result = await pool.query(
    'INSERT INTO fulltime_attendance (user_id, date, note) VALUES ($1, $2, $3) RETURNING *',
    [user_id, date, note || null]
  );
  return result.rows[0];
}

module.exports = { checkInShow };
