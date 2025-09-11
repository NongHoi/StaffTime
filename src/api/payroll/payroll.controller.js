const payrollModel = require('./payroll.model');

module.exports = (io, connectedUsers) => {
    // Helper function to send notification
    const sendNotification = (userId, message) => {
        const socketId = connectedUsers[userId];
        if (socketId) {
            io.to(socketId).emit('notification', { message });
        }
    };

    // Lưu bảng lương đã tính
    const savePayroll = async (req, res) => {
        try {
            const data = req.body;
            // Validate các trường bắt buộc
            const required = ['user_id', 'month', 'year', 'total'];
            for (const key of required) {
                if (data[key] === undefined) return res.status(400).json({ message: `Thiếu trường ${key}` });
            }
            const payroll = await payrollModel.savePayroll(data);

            // Gửi thông báo cho nhân viên
            const message = `Bảng lương tháng ${data.month}/${data.year} của bạn đã được tạo.`;
            sendNotification(data.user_id, message);

            res.json(payroll);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };

    // Lấy danh sách bảng lương đã lưu của 1 user
    const getPayrollsByUser = async (req, res) => {
        try {
            const { user_id } = req.params;
            const payrolls = await payrollModel.getPayrollsByUser(user_id);
            res.json(payrolls);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };

    // Lấy chi tiết bảng lương theo id
    const getPayrollById = async (req, res) => {
        try {
            const { id } = req.params;
            const payroll = await payrollModel.getPayrollById(id);
            res.json(payroll);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };

    return { savePayroll, getPayrollsByUser, getPayrollById };
};
