const fulltimeSalaryModel = require('../models/fulltimeSalaryModel');

const calcFulltimeSalary = async (req, res) => {
  try {
    const { user_id, month, year } = req.body;
    if (!user_id || !month || !year) return res.status(400).json({ message: 'Thiếu thông tin.' });
    const salaryInfo = await fulltimeSalaryModel.getFulltimeSalaryInfo(user_id);
    if (!salaryInfo) return res.status(400).json({ message: 'Chưa cấu hình lương cho nhân viên.' });
    const showInfo = await fulltimeSalaryModel.getShowInfo(user_id, month, year);
    const total = Number(salaryInfo.base_salary || 0) + Number(showInfo.total_show_salary || 0) + Number(salaryInfo.allowance || 0) + Number(salaryInfo.bonus || 0);
    res.json({
      user_id,
      month,
      year,
      base_salary: salaryInfo.base_salary,
      show_count: showInfo.show_count,
      total_show_salary: showInfo.total_show_salary,
      allowance: salaryInfo.allowance,
      bonus: salaryInfo.bonus,
      total
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { calcFulltimeSalary };
