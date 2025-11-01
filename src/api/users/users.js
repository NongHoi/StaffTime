const User = require('../../schema/User');

module.exports = (io, connectedUsers) => {
    // Helper function to send notification
    const sendNotification = (userId, message) => {
        const socketId = connectedUsers[userId];
        if (socketId) {
            io.to(socketId).emit('notification', { message });
        }
    };

    const getUsers = async (req, res) => {
        try {
            const users = await User.find({}, '-password').sort({ created_at: -1 });
            // Transform full_name to fullname for frontend compatibility
            const transformedUsers = users.map(user => ({
                ...user.toObject(),
                id: user._id,
                fullname: user.full_name,
                type: user.salary_config?.type || 'parttime',
                // Add salary config fields for frontend display
                day_shift_rate: user.salary_config?.day_shift_rate || 0,
                night_shift_rate: user.salary_config?.night_shift_rate || 0,
                base_salary: user.salary_config?.base_salary || 0,
                show_salary: user.salary_config?.show_salary || 0,
                allowance: user.salary_config?.allowance || 0,
                bonus: user.salary_config?.bonus || 0
            }));
            res.json(transformedUsers);
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    };

    const changeRole = async (req, res) => {
        try {
            const { userId } = req.params;
            const { roleId } = req.body;
            const currentUserId = req.session.user.id;
            if (!userId || !roleId) return res.status(400).json({ message: 'Thiếu thông tin.' });
            if (userId === currentUserId) return res.status(400).json({ message: 'Không thể tự hạ quyền bản thân!' });
            
            const user = await User.findByIdAndUpdate(
                userId, 
                { role_id: roleId }, 
                { new: true }
            ).select('-password');

            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy user.' });
            }

            // Gửi thông báo
            const roleName = roleId === 1 ? 'Admin' : (roleId === 2 ? 'Manager' : 'Nhân viên');
            sendNotification(userId, `Quyền của bạn đã được thay đổi thành ${roleName}.`);

            res.json({ message: 'Cập nhật quyền thành công', user });
        } catch (err) {
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const changeType = async (req, res) => {
        try {
            const { userId } = req.params;
            const { type } = req.body;
            if (!userId || !type) return res.status(400).json({ message: 'Thiếu thông tin.' });
            
            const user = await User.findByIdAndUpdate(
                userId, 
                { 'salary_config.type': type }, 
                { new: true }
            ).select('-password');

            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy user.' });
            }

            // Gửi thông báo
            sendNotification(userId, `Loại nhân viên của bạn đã được cập nhật thành ${type}.`);

            res.json({ message: 'Cập nhật loại nhân viên thành công', user });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    };

    const removeUser = async (req, res) => {
        try {
            const { userId } = req.params;
            const currentUserId = req.session.user.id;
            if (!userId) return res.status(400).json({ message: 'Thiếu thông tin.' });
            if (userId === currentUserId) return res.status(400).json({ message: 'Không thể tự xóa bản thân!' });
            
            // Gửi thông báo trước khi xóa
            sendNotification(userId, 'Tài khoản của bạn đã bị quản trị viên xóa khỏi hệ thống.');

            const deletedUser = await User.findByIdAndDelete(userId);
            if (!deletedUser) {
                return res.status(404).json({ message: 'Không tìm thấy user.' });
            }

            res.json({ message: 'Xóa user thành công' });
        } catch (err) {
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const setSalary = async (req, res) => {
        try {
            const { userId, type, day_shift_rate, night_shift_rate, base_salary, allowance, bonus, show_salary } = req.body;
            if (!userId) return res.status(400).json({ message: 'Thiếu thông tin user.' });
            
            // Calculate hourly_salary based on type
            let hourly_salary = 0;
            if (type === 'parttime') {
                hourly_salary = parseFloat(day_shift_rate) || 0;
            } else if (type === 'fulltime') {
                hourly_salary = parseFloat(base_salary) || 0;
            }

            const updateData = {
                hourly_salary: hourly_salary,
                // Store additional salary info in a separate field for future use
                salary_config: {
                    type: type,
                    day_shift_rate: parseFloat(day_shift_rate) || 0,
                    night_shift_rate: parseFloat(night_shift_rate) || 0,
                    base_salary: parseFloat(base_salary) || 0,
                    allowance: parseFloat(allowance) || 0,
                    bonus: parseFloat(bonus) || 0,
                    show_salary: parseFloat(show_salary) || 0
                }
            };

            const user = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true }
            ).select('-password');

            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy user.' });
            }

            // Gửi thông báo
            sendNotification(userId, 'Thông tin lương của bạn vừa được cập nhật.');

            res.json({ message: 'Cập nhật lương thành công', user });
        } catch (err) {
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const getUserSalary = async (req, res) => {
        try {
            const { userId } = req.params;
            if (!userId) return res.status(400).json({ message: 'Thiếu thông tin user.' });
            
            const user = await User.findById(userId).select('salary_config hourly_salary');
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy user.' });
            }

            res.json({
                salary_config: user.salary_config || {},
                hourly_salary: user.hourly_salary || 0
            });
        } catch (err) {
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    return { getUsers, changeRole, changeType, removeUser, setSalary, getUserSalary };
};
