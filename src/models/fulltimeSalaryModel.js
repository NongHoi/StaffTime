const pool = require('../config/db');

// Lấy lương cứng, phụ cấp, chuyên cần, thưởng của user
async function getFulltimeSalaryInfo(user_id) {
  const result = await pool.query('SELECT base_salary, allowance, bonus FROM salary WHERE user_id = $1 ORDER BY id DESC LIMIT 1', [user_id]);
  return result.rows[0];
}

// Lấy tổng số show và tổng tiền show trong tháng
async function getShowInfo(user_id, month, year) {
  // Giả sử có bảng show_attendance: user_id, show_id, date
  const result = await pool.query(
    `SELECT s.price, COUNT(sa.id) as show_count, SUM(s.price) as total_show_salary
     FROM show_attendance sa
     JOIN show s ON sa.show_id = s.id
     WHERE sa.user_id = $1 AND EXTRACT(MONTH FROM sa.date) = $2 AND EXTRACT(YEAR FROM sa.date) = $3
     GROUP BY s.price`,
    [user_id, month, year]
  );
  // Tổng số show và tổng tiền show
  let show_count = 0, total_show_salary = 0;
  for (const row of result.rows) {
    show_count += Number(row.show_count);
    total_show_salary += Number(row.total_show_salary);
  }
  return { show_count, total_show_salary };
}

module.exports = { getFulltimeSalaryInfo, getShowInfo };
