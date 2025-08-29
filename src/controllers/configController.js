const configModel = require('../models/configModel');

// Lấy giờ ca đêm mới nhất
const getNightShiftTime = async (req, res) => {
  try {
    const data = await configModel.getNightShiftTime();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lưu giờ ca đêm mới
const setNightShiftTime = async (req, res) => {
  try {
    const { night_shift_start, night_shift_end } = req.body;
    if (!night_shift_start || !night_shift_end) return res.status(400).json({ message: 'Thiếu thông tin.' });
    const data = await configModel.setNightShiftTime({ night_shift_start, night_shift_end });
    res.json({ message: 'Cập nhật giờ ca đêm thành công', data });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { getNightShiftTime, setNightShiftTime };
