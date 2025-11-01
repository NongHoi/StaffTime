
const bcrypt = require('bcrypt');
const User = require('../../schema/User');

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
    const sessionUser = {
      id: user._id,
      username: user.username,
      role_id: user.role_id,
      fullname: user.full_name, // Convert full_name to fullname for frontend compatibility
      type: user.salary_config?.type || 'parttime', // Add type for frontend
      email: user.email,
      phone: user.phone
    };
    req.session.user = sessionUser;
    res.json({ message: 'Đăng nhập thành công', user: sessionUser });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const me = async (req, res) => {
  if (req.session.user) {
    try {
      // Refresh user data from database to get latest info
      const user = await User.findById(req.session.user.id);
      if (!user) {
        return res.status(401).json({ authenticated: false, message: 'User không tồn tại' });
      }
      
      const updatedUser = {
        id: user._id,
        username: user.username,
        role_id: user.role_id,
        fullname: user.full_name,
        type: user.salary_config?.type || 'parttime',
        email: user.email,
        phone: user.phone
      };
      
      // Update session with latest data
      req.session.user = updatedUser;
      res.json({ authenticated: true, user: updatedUser });
    } catch (err) {
      res.status(500).json({ authenticated: false, message: 'Lỗi server' });
    }
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
