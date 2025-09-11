
const bcrypt = require('bcrypt');
const userModel = require('../users/user.model');

const register = async (req, res) => {
  try {
    const { username, password, fullname, phone, email } = req.body;
    if (!username || !password || !fullname) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' });
    }
    const existingUser = await userModel.findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username đã tồn tại.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Mặc định role_id = 3 (user), type = 'parttime'
    const user = await userModel.createUser({
      username,
      password: hashedPassword,
      fullname,
      phone,
      email,
      role_id: 3,
      type: 'parttime',
    });
    res.status(201).json({ message: 'Đăng ký thành công', user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userModel.findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Sai username hoặc password.' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Sai username hoặc password.' });
    }
    // Lưu thông tin user vào session
    req.session.user = {
      id: user.id,
      username: user.username,
      role_id: user.role_id,
      type: user.type,
      fullname: user.fullname
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
