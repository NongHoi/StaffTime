const fulltimeSalaryModel = require('../models/fulltimeSalaryModel');

const calcFulltimeSalary = async (req, res) => {
  try {
  const { user_id, month, year, allowance, bonus } = req.body;
    if (!user_id || !month || !year) return res.status(400).json({ message: 'Thiếu thông tin.' });
    const salaryInfo = await fulltimeSalaryModel.getFulltimeSalaryInfo(user_id);
    if (!salaryInfo) return res.status(400).json({ message: 'Chưa cấu hình lương cho nhân viên.' });
    if (salaryInfo.show_salary === undefined || salaryInfo.show_salary === null) {
      return res.status(400).json({ message: 'Chưa cấu hình lương show cho nhân viên.' });
    }
    if (salaryInfo.base_salary === undefined || salaryInfo.base_salary === null) {
      return res.status(400).json({ message: 'Chưa cấu hình lương cứng cho nhân viên.' });
    }
    const showInfo = await fulltimeSalaryModel.getShowInfo(user_id, month, year);
    const show_count = Number(showInfo.show_count || 0);
    const show_salary = Number(salaryInfo.show_salary || 0);
    const total_show_salary = show_salary * show_count;
  // Ưu tiên allowance/bonus nhập từ frontend, nếu không có thì lấy từ DB
  const allowanceVal = allowance !== undefined ? Number(allowance) : Number(salaryInfo.allowance || 0);
  const bonusVal = bonus !== undefined ? Number(bonus) : Number(salaryInfo.bonus || 0);
  const total = Number(salaryInfo.base_salary || 0) + total_show_salary + allowanceVal + bonusVal;
    res.json({
      user_id,
      month,
      year,
      base_salary: salaryInfo.base_salary,
      show_count,
      total_show_salary,
      allowance: allowanceVal,
      bonus: bonusVal,
      total
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { calcFulltimeSalary };
