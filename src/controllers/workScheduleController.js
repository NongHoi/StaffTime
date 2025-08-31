const workScheduleModel = require('../models/workScheduleModel');

// Tạo lịch làm (admin/manager)
const createWorkSchedule = async (req, res) => {
  try {
    const { date, job_name, start_time, location, note } = req.body;
  const created_by = req.session.user.id;
    const schedule = await workScheduleModel.createWorkSchedule({ date, job_name, start_time, location, note, created_by });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy lịch làm theo tháng
const getWorkSchedulesByMonth = async (req, res) => {
  try {
    const { year, month } = req.query;
    const schedules = await workScheduleModel.getWorkSchedulesByMonth(year, month);
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy chi tiết lịch làm
const getWorkScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await workScheduleModel.getWorkScheduleById(id);
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Sửa lịch làm
const updateWorkSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const schedule = await workScheduleModel.updateWorkSchedule(id, fields);
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa lịch làm
const deleteWorkSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    await workScheduleModel.deleteWorkSchedule(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đăng ký lịch làm (nhân viên)
const registerWorkSchedule = async (req, res) => {
  try {
    const { schedule_id } = req.body;
  const user_id = req.session.user.id;
    const reg = await workScheduleModel.registerWorkSchedule(schedule_id, user_id);
    res.json(reg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách nhân viên đã đăng ký cho 1 lịch làm
const getRegistrationsBySchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const regs = await workScheduleModel.getRegistrationsBySchedule(id);
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy lịch làm đã đăng ký của user, có thể filter theo tháng/năm
const getSchedulesForUser = async (req, res) => {
  try {
    const user_id = req.session.user.id;
    const { year, month } = req.query;
    const schedules = await workScheduleModel.getSchedulesForUser(user_id, year, month);
    res.json(schedules);
  } catch (err) {
    console.error('Lỗi getSchedulesForUser:', err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
};

module.exports = {
  createWorkSchedule,
  getWorkSchedulesByMonth,
  getWorkScheduleById,
  updateWorkSchedule,
  deleteWorkSchedule,
  registerWorkSchedule,
  getRegistrationsBySchedule,
  getSchedulesForUser
};
