const WorkSchedule = require('../../models/WorkSchedule');
const User = require('../../models/User');

module.exports = (io, connectedUsers) => {
    const sendNotification = (userId, message) => {
        const socketId = connectedUsers[userId];
        if (socketId) {
            io.to(socketId).emit('notification', { message });
        }
    };

    const getMonthSchedule = async (req, res) => {
        try {
            const { year, month } = req.query;
            
            if (!year || !month) {
                return res.status(400).json({ message: 'Thiếu tháng hoặc năm' });
            }

            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);

            const schedules = await WorkSchedule.find({
                work_date: {
                    $gte: startDate,
                    $lte: endDate
                }
            }).populate('user_id', 'full_name username');

            // Transform to match frontend expectations
            const transformedSchedules = schedules.map(schedule => ({
                ...schedule.toObject(),
                user: schedule.user_id ? {
                    id: schedule.user_id._id,
                    fullname: schedule.user_id.full_name,
                    username: schedule.user_id.username
                } : null
            }));

            res.json(transformedSchedules);

        } catch (err) {
            console.error('getMonthSchedule error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const getMyRegistrations = async (req, res) => {
        try {
            const user_id = req.session.user?.id;
            if (!user_id) {
                return res.status(401).json({ message: 'Chưa đăng nhập' });
            }

            const { year, month } = req.query;
            let query = { user_id: user_id };

            if (year && month) {
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0, 23, 59, 59);
                query.work_date = {
                    $gte: startDate,
                    $lte: endDate
                };
            }

            const schedules = await WorkSchedule.find(query).sort({ work_date: -1 });

            res.json(schedules);

        } catch (err) {
            console.error('getMyRegistrations error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const registerWorkSchedule = async (req, res) => {
        try {
            const user_id = req.session.user?.id;
            if (!user_id) {
                return res.status(401).json({ message: 'Chưa đăng nhập' });
            }

            const { date, shift_type, start_time, end_time } = req.body;

            if (!date || !shift_type || !start_time || !end_time) {
                return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
            }

            // Check if already registered for this date
            const existing = await WorkSchedule.findOne({
                user_id: user_id,
                work_date: new Date(date)
            });

            if (existing) {
                return res.status(400).json({ message: 'Đã đăng ký ca làm cho ngày này' });
            }

            // Calculate total hours
            const startHour = parseInt(start_time.split(':')[0]) + parseInt(start_time.split(':')[1]) / 60;
            const endHour = parseInt(end_time.split(':')[0]) + parseInt(end_time.split(':')[1]) / 60;
            const totalHours = endHour > startHour ? endHour - startHour : (24 - startHour) + endHour;

            const schedule = new WorkSchedule({
                user_id: user_id,
                work_date: new Date(date),
                shift_type: shift_type,
                start_time: start_time,
                end_time: end_time,
                total_hours: Math.round(totalHours * 10) / 10,
                status: 'scheduled'
            });

            await schedule.save();

            // Notify managers and emit realtime event
            const managers = await User.find({ role_id: { $in: [1, 2] } });
            managers.forEach(manager => {
                sendNotification(manager._id.toString(), `${req.session.user?.full_name || req.session.user?.username} đã đăng ký ca làm mới cho ngày ${date}`);
            });

            // Emit new work schedule event
            io.emit('new_work_schedule', {
                scheduleId: schedule._id,
                userId: user_id,
                userName: req.session.user?.full_name || req.session.user?.username,
                date: schedule.work_date,
                shiftType: shift_type,
                startTime: start_time,
                endTime: end_time,
                message: `${req.session.user?.full_name || req.session.user?.username} đăng ký ca ${shift_type} ngày ${new Date(date).toLocaleDateString('vi-VN')}`,
                timestamp: new Date()
            });

            res.json({ 
                message: 'Đăng ký ca làm thành công', 
                schedule 
            });

        } catch (err) {
            console.error('registerWorkSchedule error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const updateScheduleStatus = async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const schedule = await WorkSchedule.findByIdAndUpdate(
                id,
                { status },
                { new: true }
            ).populate('user_id', 'full_name');

            if (!schedule) {
                return res.status(404).json({ message: 'Không tìm thấy lịch làm việc' });
            }

            // Send notification and emit event
            if (schedule.user_id && schedule.user_id._id) {
                const userId = schedule.user_id._id.toString();
                sendNotification(userId, `Trạng thái ca làm đã được cập nhật: ${status === 'approved' ? 'Đã duyệt' : status === 'rejected' ? 'Từ chối' : status}`);
            }

            // Emit schedule status update event
            io.emit('work_schedule_update', {
                scheduleId: schedule._id,
                userId: schedule.user_id?._id,
                userName: schedule.user_id?.full_name,
                status: status,
                message: `Ca làm của ${schedule.user_id?.full_name} đã được cập nhật: ${status}`,
                timestamp: new Date()
            });

            res.json({ 
                message: 'Cập nhật trạng thái thành công', 
                schedule 
            });

        } catch (err) {
            console.error('updateScheduleStatus error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    return {
        getMonthSchedule,
        getMyRegistrations,
        registerWorkSchedule,
        updateScheduleStatus
    };
};