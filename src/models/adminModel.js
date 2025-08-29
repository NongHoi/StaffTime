const pool = require('../config/db');

const getAllUsers = async () => {
  // Lấy lương ngày, đêm, tổng lương mới nhất cho từng user
  const result = await pool.query(`
    SELECT u.id, u.username, u.fullname, u.phone, u.email, u.role_id, u.type, u.bank_account_number, u.bank_name,
      s.day_shift_rate, s.night_shift_rate, s.total
    FROM users u
    LEFT JOIN LATERAL (
      SELECT day_shift_rate, night_shift_rate, total
      FROM salary s2 WHERE s2.user_id = u.id
      ORDER BY year DESC, month DESC, id DESC LIMIT 1
    ) s ON true
    ORDER BY u.id
  `);
  // Format tiền tệ
  const formatMoney = v => v == null ? '' : Number(v).toLocaleString('vi-VN');
  return result.rows.map(u => ({
    ...u,
    day_shift_rate: formatMoney(u.day_shift_rate),
    night_shift_rate: formatMoney(u.night_shift_rate),
    total: formatMoney(u.total)
  }));
};

const updateUserRole = async (userId, roleId, currentUserId) => {
  if (userId === currentUserId) throw new Error('Không thể tự hạ quyền bản thân!');
  const result = await pool.query('UPDATE users SET role_id = $1 WHERE id = $2 RETURNING *', [roleId, userId]);
  return result.rows[0];
};

const updateUserType = async (userId, type) => {
  const result = await pool.query('UPDATE users SET type = $1 WHERE id = $2 RETURNING *', [type, userId]);
  return result.rows[0];
};

const deleteUser = async (userId, currentUserId) => {
  if (userId === currentUserId) throw new Error('Không thể tự xóa bản thân!');
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  return true;
};

const setSalary = async ({ userId, type, day_shift_rate, night_shift_rate, base_salary, allowance, bonus }) => {
  let result;
  if (type === 'fulltime') {
    result = await pool.query(
      `INSERT INTO salary (user_id, base_salary, allowance, bonus, day_shift_rate, night_shift_rate)
       VALUES ($1, $2, $3, $4, NULL, NULL) RETURNING *`,
      [userId || null,
       base_salary !== '' ? base_salary : null,
       allowance !== '' ? allowance : null,
       bonus !== '' ? bonus : null]
    );
  } else if (type === 'parttime') {
    result = await pool.query(
      `INSERT INTO salary (user_id, day_shift_rate, night_shift_rate, base_salary, allowance, bonus)
       VALUES ($1, $2, $3, NULL, NULL, NULL) RETURNING *`,
      [userId || null,
       day_shift_rate !== '' ? day_shift_rate : null,
       night_shift_rate !== '' ? night_shift_rate : null]
    );
  } else {
    result = await pool.query(
      `INSERT INTO salary (user_id) VALUES ($1) RETURNING *`,
      [userId || null]
    );
  }
  return result.rows[0];
};

module.exports = { getAllUsers, updateUserRole, updateUserType, deleteUser, setSalary };
