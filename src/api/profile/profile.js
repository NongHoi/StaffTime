const profileModel = require('./profile.model');

const updateProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { fullname, phone, email, bank_account_number, bank_name } = req.body;
    if (!fullname || !email) return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' });
    const user = await profileModel.updateUserProfile(userId, { fullname, phone, email, bank_account_number, bank_name });
    res.json({ message: 'Cập nhật thông tin thành công', user });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = await profileModel.getUserProfile(userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { updateProfile, getProfile };
