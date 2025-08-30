const pool = require('../config/db');

// Lấy lương cứng, phụ cấp, chuyên cần, thưởng của user
async function getFulltimeSalaryInfo(user_id) {
  const result = await pool.query('SELECT base_salary, show_salary, allowance, bonus FROM salary WHERE user_id = $1 ORDER BY id DESC LIMIT 1', [user_id]);
  return result.rows[0];
}

// Lấy tổng số show (số ngày đi show) trong tháng từ bảng fulltime_attendance
async function getShowInfo(user_id, month, year) {
  const result = await pool.query(
    `SELECT COUNT(*) as show_count FROM fulltime_attendance WHERE user_id = $1 AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3`,
    [user_id, month, year]
  );
  const show_count = Number(result.rows[0].show_count || 0);
  return { show_count };
}

module.exports = { getFulltimeSalaryInfo, getShowInfo };
