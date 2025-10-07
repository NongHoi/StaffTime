
const bcrypt = require('bcrypt');
const User = require('../../models/User');

const register = async (req, res) => {
  try {
    const { username, password, fullname, phone, email } = req.body;
    if (!username || !password || !fullname) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username đã tồn tại.' });
    }
    
    // Tạo user mới (password sẽ được hash trong pre-save hook)
    const user = new User({
      username,
      password,
      full_name: fullname,
      phone,
      email,
      role_id: 3 // Mặc định là employee
    });
    
    await user.save();
    res.status(201).json({ message: 'Đăng ký thành công', user: { id: user._id, username: user.username } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Sai username hoặc password.' });
    }
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Sai username hoặc password.' });
    }
    // Lưu thông tin user vào session
    req.session.user = {
      id: user._id,
      username: user.username,
      role_id: user.role_id,
      full_name: user.full_name
    };
    res.json({ message: 'Đăng nhập thành công', user: req.session.user });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const me = (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.status(401).json({ authenticated: false, message: 'Chưa đăng nhập' });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi đăng xuất', error: err.message });
    }
    res.json({ message: 'Đăng xuất thành công' });
  });
};

module.exports = { register, login, me, logout };
