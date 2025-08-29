const salaryModel = require('../models/salaryModel');
const configModel = require('../models/configModel');

const calcParttimeSalary = async (req, res) => {
  try {
    const { user_id, month, year } = req.body;
    if (!user_id || !month || !year) return res.status(400).json({ message: 'Thiếu thông tin.' });
    let config = await configModel.getNightShiftTime();
    let night_shift_start = '21:00';
    let night_shift_end = '04:00';
    if (config && config.night_shift_start && config.night_shift_end) {
      night_shift_start = config.night_shift_start;
      night_shift_end = config.night_shift_end;
    }
    const { totalDay, totalNight } = await salaryModel.getWorkingHours(user_id, month, year, night_shift_start, night_shift_end);
    const salaryInfo = await salaryModel.getUserSalary(user_id);
    if (!salaryInfo) return res.status(400).json({ message: 'Chưa cấu hình mức lương cho nhân viên.' });
    const total = totalDay * salaryInfo.day_shift_rate + totalNight * salaryInfo.night_shift_rate + (salaryInfo.allowance || 0) + (salaryInfo.bonus || 0);
    res.json({
      user_id,
      month,
      year,
      totalDay,
      totalNight,
      day_shift_rate: salaryInfo.day_shift_rate,
      night_shift_rate: salaryInfo.night_shift_rate,
      allowance: salaryInfo.allowance,
      bonus: salaryInfo.bonus,
      total
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { calcParttimeSalary };
