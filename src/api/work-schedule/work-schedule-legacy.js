// Legacy work schedule controller for compatibility with frontend
const LegacyWorkSchedule = require('../../schema/LegacyWorkSchedule');
const User = require('../../schema/User');

module.exports = (io, connectedUsers) => {
    const sendNotification = (userId, message) => {
        const socketId = connectedUsers[userId];
        if (socketId) {
            io.to(socketId).emit('notification', { message });
        }
    };

    // Get work schedules by month
    const getMonthSchedules = async (req, res) => {
        try {
            const { year, month } = req.query;
            
            if (!year || !month) {
                return res.status(400).json({ message: 'Thiếu tháng hoặc năm' });
            }

            // Create date range for the month
            const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
            const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

            const schedules = await LegacyWorkSchedule.find({
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            }).populate('created_by', 'full_name username').sort({ date: 1 });

            res.json(schedules);
        } catch (err) {
            console.error('getMonthSchedules error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    // Create work schedule
    const createSchedule = async (req, res) => {
        try {
            const { date, job_name, start_time, location, note } = req.body;
            const created_by = req.session.user?.id;

            if (!date || !job_name) {
                return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
            }

            if (!created_by) {
                return res.status(401).json({ message: 'Chưa đăng nhập' });
            }

            const schedule = new LegacyWorkSchedule({
                date: date,
                job_name: job_name,
                start_time: start_time || '',
                location: location || '',
                note: note || '',
                created_by: created_by,
                registrations: []
            });

            await schedule.save();

            res.json(schedule);
        } catch (err) {
            console.error('createSchedule error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    // Update work schedule
    const updateSchedule = async (req, res) => {
        try {
            const { id } = req.params;
            const { job_name, start_time, location, note } = req.body;

            const schedule = await LegacyWorkSchedule.findById(id);
            if (!schedule) {
                return res.status(404).json({ message: 'Không tìm thấy lịch làm việc' });
            }

            // Update fields
            if (job_name !== undefined) schedule.job_name = job_name;
            if (start_time !== undefined) schedule.start_time = start_time;
            if (location !== undefined) schedule.location = location;
            if (note !== undefined) schedule.note = note;

            await schedule.save();

            res.json(schedule);
        } catch (err) {
            console.error('updateSchedule error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    // Delete work schedule
    const deleteSchedule = async (req, res) => {
        try {
            const { id } = req.params;

            const schedule = await LegacyWorkSchedule.findById(id);
            if (!schedule) {
                return res.status(404).json({ message: 'Không tìm thấy lịch làm việc' });
            }

            await LegacyWorkSchedule.findByIdAndDelete(id);

            res.json({ success: true, message: 'Xóa lịch làm thành công' });
        } catch (err) {
            console.error('deleteSchedule error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    // Register for work schedule
    const registerSchedule = async (req, res) => {
        try {
            const { schedule_id } = req.body;
            const user_id = req.session.user?.id;
            const user_name = req.session.user?.fullname || req.session.user?.username || 'User';

            if (!user_id) {
                return res.status(401).json({ message: 'Chưa đăng nhập' });
            }

            const schedule = await LegacyWorkSchedule.findById(schedule_id);
            if (!schedule) {
                return res.status(404).json({ message: 'Không tìm thấy lịch làm việc' });
            }

            // Check if already registered
            const alreadyRegistered = schedule.registrations?.some(reg => reg.user_id.toString() === user_id);
            if (alreadyRegistered) {
                return res.status(400).json({ message: 'Đã đăng ký lịch này rồi' });
            }

            // Add registration
            schedule.registrations.push({
                user_id: user_id,
                user_name: user_name,
                registered_at: new Date()
            });

            await schedule.save();

            // Send notification to the schedule creator
            if (schedule.created_by) {
                sendNotification(schedule.created_by, `Nhân viên ${user_name} vừa đăng ký lịch làm việc "${schedule.job_name}" ngày ${schedule.date}.`);
            }

            res.json({ message: 'Đăng ký thành công', schedule });
        } catch (err) {
            console.error('registerSchedule error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    // Get registrations for a schedule
    const getRegistrations = async (req, res) => {
        try {
            const { id } = req.params;

            const schedule = await LegacyWorkSchedule.findById(id).populate('registrations.user_id', 'full_name username');
            if (!schedule) {
                return res.status(404).json({ message: 'Không tìm thấy lịch làm việc' });
            }

            // Return user list in expected format
            const users = (schedule.registrations || []).map(reg => ({
                id: reg.user_id._id,
                fullname: reg.user_id.full_name,
                username: reg.user_id.username
            }));

            res.json(users);
        } catch (err) {
            console.error('getRegistrations error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    // Get user's registered schedules
    const getMyRegistrations = async (req, res) => {
        try {
            const user_id = req.session.user?.id;
            if (!user_id) {
                return res.status(401).json({ message: 'Chưa đăng nhập' });
            }

            const mySchedules = await LegacyWorkSchedule.find({
                'registrations.user_id': user_id
            }).sort({ date: -1 });

            res.json(mySchedules);
        } catch (err) {
            console.error('getMyRegistrations error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    // Get all work schedules
    const getAllSchedules = async (req, res) => {
        try {
            const schedules = await LegacyWorkSchedule.find({})
                .populate('created_by', 'full_name username')
                .sort({ date: -1 });

            res.json(schedules);
        } catch (err) {
            console.error('getAllSchedules error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    return {
        getMonthSchedules,
        getAllSchedules,
        createSchedule,
        updateSchedule,
        deleteSchedule,
        registerSchedule,
        getRegistrations,
        getMyRegistrations
    };
};