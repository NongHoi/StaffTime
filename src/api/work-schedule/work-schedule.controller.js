const workScheduleModel = require('./work-schedule.model');
const userModel = require('../users/user.model'); // Import user model

module.exports = (io, connectedUsers) => {
    // Helper function to send notification
    const sendNotification = (userId, message) => {
        const socketId = connectedUsers[userId];
        if (socketId) {
            io.to(socketId).emit('notification', { message });
        }
    };

    // Tạo lịch làm (admin/manager)
    const createWorkSchedule = async (req, res) => {
        try {
            const { date, job_name, start_time, location, note, assigned_users } = req.body;
            const created_by = req.session.user.id;
            const schedule = await workScheduleModel.createWorkSchedule({ date, job_name, start_time, location, note, created_by, assigned_users });

            // Gửi thông báo cho các user được gán
            if (assigned_users && assigned_users.length > 0) {
                const message = `Bạn đã được gán vào một lịch làm việc mới vào ngày ${new Date(date).toLocaleDateString('vi-VN')}: ${job_name}.`;
                assigned_users.forEach(userId => {
                    sendNotification(userId, message);
                });
            }

            res.json(schedule);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };

    // Lấy lịch làm theo tháng
    const getWorkSchedulesByMonth = async (req, res) => {
        try {
            const { year, month } = req.query;
            const schedules = await workScheduleModel.getWorkSchedulesByMonth(year, month);
            res.json(schedules);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };

    // Lấy chi tiết lịch làm
    const getWorkScheduleById = async (req, res) => {
        try {
            const { id } = req.params;
            const schedule = await workScheduleModel.getWorkScheduleById(id);
            res.json(schedule);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };

    // Sửa lịch làm
    const updateWorkSchedule = async (req, res) => {
        try {
            const { id } = req.params;
            const fields = req.body;
            const schedule = await workScheduleModel.updateWorkSchedule(id, fields);
            res.json(schedule);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };

    // Xóa lịch làm
    const deleteWorkSchedule = async (req, res) => {
        try {
            const { id } = req.params;
            await workScheduleModel.deleteWorkSchedule(id);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };

    // Đăng ký lịch làm (nhân viên)
    const registerWorkSchedule = async (req, res) => {
        try {
            const { schedule_id } = req.body;
            const user_id = req.session.user.id;
            const reg = await workScheduleModel.registerWorkSchedule(schedule_id, user_id);

            // Thông báo cho admin/manager
            const schedule = await workScheduleModel.getWorkScheduleById(schedule_id);
            if (schedule && schedule.created_by) {
                const adminSocketId = connectedUsers[schedule.created_by];
                if (adminSocketId) {
                     const user = await userModel.findById(user_id);
                     const message = `Nhân viên ${user.fullname || user.username} vừa đăng ký lịch làm việc "${schedule.job_name}" ngày ${new Date(schedule.date).toLocaleDateString('vi-VN')}.`;
                     io.to(adminSocketId).emit('notification', { message });
                }
            }

            res.json(reg);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };

    // Lấy danh sách nhân viên đã đăng ký cho 1 lịch làm
    const getRegistrationsBySchedule = async (req, res) => {
        try {
            const { id } = req.params;
            const regs = await workScheduleModel.getRegistrationsBySchedule(id);
            res.json(regs);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };

    // Lấy lịch làm đã đăng ký của user, có thể filter theo tháng/năm
    const getSchedulesForUser = async (req, res) => {
        try {
            const user_id = req.session.user.id;
            const { year, month } = req.query;
            const schedules = await workScheduleModel.getSchedulesForUser(user_id, year, month);
            res.json(schedules);
        } catch (err) {
            console.error('Lỗi getSchedulesForUser:', err);
            res.status(500).json({ message: err.message, stack: err.stack });
        }
    };


    return {
        createWorkSchedule,
        getWorkSchedulesByMonth,
        getWorkScheduleById,
        updateWorkSchedule,
        deleteWorkSchedule,
        registerWorkSchedule,
        getRegistrationsBySchedule,
        getSchedulesForUser
    };
};
