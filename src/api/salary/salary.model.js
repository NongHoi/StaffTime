const pool = require('../../config/db');

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
  const NIGHT_START = 21;
  for (const row of result.rows) {
    let inTime = new Date(row.check_in);
    let outTime = new Date(row.check_out);
    let inHour = inTime.getHours() + inTime.getMinutes() / 60;
    let outHour = outTime.getHours() + outTime.getMinutes() / 60;
    // Nếu out < in thì out += 24 (qua ngày)
    if (outHour < inHour) outHour += 24;
    // Tổng số phút làm việc
    let totalMinutes = (outHour - inHour) * 60;
    // Làm tròn lên 0.1h
    let totalDecimal = Math.ceil(totalMinutes / 6) / 10; // 6 phút = 0.1h

    // Giờ sau 21h
    let after21h = 0;
    if (inHour >= NIGHT_START) {
      // Ca bắt đầu sau 21h: toàn bộ giờ là sau 21h
      after21h = totalDecimal;
    } else if (outHour > NIGHT_START) {
      // Ca kết thúc sau 21h: chỉ tính phần từ 21h đến out
      let after21Minutes = (outHour - NIGHT_START) * 60;
      after21h = Math.ceil(after21Minutes / 6) / 10;
      if (after21h > totalDecimal) after21h = totalDecimal; // không vượt quá tổng ca
    }
    // Giờ ngày = tổng - sau 21h
    let dayHour = totalDecimal - after21h;
    if (dayHour < 0) dayHour = 0;
    totalNight += after21h;
    totalDay += dayHour;
  }
  // Làm tròn về bội số 0.25h (15 phút), quy tắc 7-8
  // Làm tròn về 1 chữ số thập phân (0.1h)
  function roundToOneDecimal(hour) {
    return Math.round(hour * 10) / 10;
  }
  return {
    totalDay: roundToOneDecimal(totalDay),
    totalNight: roundToOneDecimal(totalNight)
  };
}

// Lấy mức lương từng user (manager/admin gán)
async function getUserSalary(user_id) {
  const result = await pool.query('SELECT day_shift_rate, night_shift_rate, allowance, bonus FROM salary WHERE user_id = $1 ORDER BY id DESC LIMIT 1', [user_id]);
  return result.rows[0];
}

module.exports = { getWorkingHours, getUserSalary };
