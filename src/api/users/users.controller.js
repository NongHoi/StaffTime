const userModel = require('./users.model');

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
            const users = await userModel.getAllUsers();
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
            if (Number(userId) === currentUserId) return res.status(400).json({ message: 'Không thể tự hạ quyền bản thân!' });
            const user = await userModel.updateUserRole(userId, roleId, currentUserId);

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
            const user = await userModel.updateUserType(userId, type);

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
            if (Number(userId) === currentUserId) return res.status(400).json({ message: 'Không thể tự xóa bản thân!' });
            
            // Gửi thông báo trước khi xóa
            sendNotification(userId, 'Tài khoản của bạn đã bị quản trị viên xóa khỏi hệ thống.');

            await userModel.deleteUser(userId, currentUserId);
            res.json({ message: 'Xóa user thành công' });
        } catch (err) {
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const setSalary = async (req, res) => {
        try {
            const { userId, type, day_shift_rate, night_shift_rate, base_salary, show_salary, allowance, bonus } = req.body;
            if (!userId) return res.status(400).json({ message: 'Thiếu thông tin user.' });
            const salary = await userModel.setSalary({ userId, type, day_shift_rate, night_shift_rate, base_salary, show_salary, allowance, bonus });

            // Gửi thông báo
            sendNotification(userId, 'Thông tin lương của bạn vừa được cập nhật.');

            res.json({ message: 'Cập nhật lương thành công', salary });
        } catch (err) {
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    return { getUsers, changeRole, changeType, removeUser, setSalary };
};
