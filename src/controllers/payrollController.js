const payrollModel = require('../models/payrollModel');

// Lưu bảng lương đã tính
const savePayroll = async (req, res) => {
  try {
    const data = req.body;
    // Validate các trường bắt buộc
    const required = ['user_id','month','year','total_day','total_night','day_shift_rate','night_shift_rate','total'];
    for (const key of required) {
      if (data[key] === undefined) return res.status(400).json({ message: `Thiếu trường ${key}` });
    }
    const payroll = await payrollModel.savePayroll(data);
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách bảng lương đã lưu của 1 user
const getPayrollsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const payrolls = await payrollModel.getPayrollsByUser(user_id);
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy chi tiết bảng lương theo id
const getPayrollById = async (req, res) => {
  try {
    const { id } = req.params;
    const payroll = await payrollModel.getPayrollById(id);
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { savePayroll, getPayrollsByUser, getPayrollById };
