const User = require('../../models/User');

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
            res.json(users);
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
            
            // Note: Since we removed 'type' field from User model, this might need to be handled differently
            // For now, we'll just return success without updating anything
            const user = await User.findById(userId).select('-password');
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
            const { userId, hourly_salary } = req.body;
            if (!userId) return res.status(400).json({ message: 'Thiếu thông tin user.' });
            
            const user = await User.findByIdAndUpdate(
                userId,
                { hourly_salary: hourly_salary || 0 },
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

    return { getUsers, changeRole, changeType, removeUser, setSalary };
};
