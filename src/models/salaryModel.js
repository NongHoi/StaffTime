const pool = require('../config/db');

// Lấy tổng giờ làm ngày và đêm của 1 user trong 1 tháng
async function getWorkingHours(user_id, month, year, night_shift_start, night_shift_end) {
  const result = await pool.query(
    `SELECT check_in, check_out FROM attendance WHERE user_id = $1 AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3 AND check_out IS NOT NULL`,
    [user_id, month, year]
  );
  let totalDay = 0, totalNight = 0;
  // night_shift_start, night_shift_end dạng 'HH:mm:ss' hoặc 'HH:mm'
  const [nightStartHour, nightStartMin] = night_shift_start.split(':').map(Number);
  const [nightEndHour, nightEndMin] = night_shift_end.split(':').map(Number);
  for (const row of result.rows) {
    let inTime = new Date(row.check_in);
    let outTime = new Date(row.check_out);
    let cur = new Date(inTime);
    while (cur < outTime) {
      let next = new Date(cur);
      next.setHours(cur.getHours() + 1, 0, 0, 0);
      if (next > outTime) next = new Date(outTime);
      let hour = cur.getHours();
      let min = cur.getMinutes();
      let isNight = false;
      if (nightStartHour === nightEndHour && nightStartMin === nightEndMin) {
        // Nếu giờ bắt đầu = giờ kết thúc, không có ca đêm
        isNight = false;
      } else if (nightStartHour < nightEndHour || (nightStartHour === nightEndHour && nightStartMin < nightEndMin)) {
        // Ca đêm không qua 0h
        isNight = (hour > nightStartHour || (hour === nightStartHour && min >= nightStartMin)) &&
                  (hour < nightEndHour || (hour === nightEndHour && min < nightEndMin));
      } else {
        // Ca đêm qua 0h (ví dụ 21:00 - 04:00)
        isNight = (hour > nightStartHour || (hour === nightStartHour && min >= nightStartMin)) ||
                  (hour < nightEndHour || (hour === nightEndHour && min < nightEndMin));
      }
      let duration = (next - cur) / 3600000;
      if (isNight) totalNight += duration;
      else totalDay += duration;
      cur = next;
    }
  }
  return { totalDay, totalNight };
}

// Lấy mức lương từng user (manager/admin gán)
async function getUserSalary(user_id) {
  const result = await pool.query('SELECT day_shift_rate, night_shift_rate, allowance, bonus FROM salary WHERE user_id = $1 ORDER BY id DESC LIMIT 1', [user_id]);
  return result.rows[0];
}

module.exports = { getWorkingHours, getUserSalary };
