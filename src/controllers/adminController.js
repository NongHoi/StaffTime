const adminModel = require('../models/adminModel');

const getUsers = async (req, res) => {
  try {
    const users = await adminModel.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const changeRole = async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    const currentUserId = req.session.user.id;
    if (!userId || !roleId) return res.status(400).json({ message: 'Thiếu thông tin.' });
    if (userId === currentUserId) return res.status(400).json({ message: 'Không thể tự hạ quyền bản thân!' });
    const user = await adminModel.updateUserRole(userId, roleId, currentUserId);
    res.json({ message: 'Cập nhật quyền thành công', user });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Lỗi server' });
  }
};

const changeType = async (req, res) => {
  try {
    const { userId, type } = req.body;
    if (!userId || !type) return res.status(400).json({ message: 'Thiếu thông tin.' });
    const user = await adminModel.updateUserType(userId, type);
    res.json({ message: 'Cập nhật loại nhân viên thành công', user });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const removeUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.session.user.id;
    if (!userId) return res.status(400).json({ message: 'Thiếu thông tin.' });
    if (userId === currentUserId) return res.status(400).json({ message: 'Không thể tự xóa bản thân!' });
    await adminModel.deleteUser(userId, currentUserId);
    res.json({ message: 'Xóa user thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Lỗi server' });
  }
};

const setSalary = async (req, res) => {
  try {
    const { userId, type, day_shift_rate, night_shift_rate, base_salary, show_salary, allowance, bonus } = req.body;
    if (!userId) return res.status(400).json({ message: 'Thiếu thông tin user.' });
    const salary = await adminModel.setSalary({ userId, type, day_shift_rate, night_shift_rate, base_salary, show_salary, allowance, bonus });
    res.json({ message: 'Cập nhật lương thành công', salary });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Lỗi server' });
  }
};

module.exports = { getUsers, changeRole, changeType, removeUser, setSalary };
