const pool = require('../config/db');

// Lưu bảng lương đã tính
async function savePayroll({ user_id, month, year, total_day, total_night, day_shift_rate, night_shift_rate, allowance, bonus, total }) {
  const result = await pool.query(
    `INSERT INTO payroll (user_id, month, year, total_day, total_night, day_shift_rate, night_shift_rate, allowance, bonus, total)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [user_id, month, year, total_day, total_night, day_shift_rate, night_shift_rate, allowance, bonus, total]
  );
  return result.rows[0];
}

// Lấy danh sách bảng lương đã lưu của 1 user
async function getPayrollsByUser(user_id) {
  const result = await pool.query(
    `SELECT * FROM payroll WHERE user_id = $1 ORDER BY year DESC, month DESC, created_at DESC`,
    [user_id]
  );
  return result.rows;
}

// Lấy chi tiết bảng lương theo id
async function getPayrollById(id) {
  const result = await pool.query('SELECT * FROM payroll WHERE id = $1', [id]);
  return result.rows[0];
}

module.exports = { savePayroll, getPayrollsByUser, getPayrollById };
