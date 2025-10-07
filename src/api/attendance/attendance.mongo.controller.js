const Attendance = require('../../models/Attendance');
const WorkSchedule = require('../../models/WorkSchedule');

module.exports = (io, connectedUsers) => {
    // Helper function to send notification
    const sendNotification = (userId, message) => {
        const socketId = connectedUsers[userId];
        if (socketId) {
            io.to(socketId).emit('notification', { message });
        }
    };

    const getMyAttendanceByDate = async (req, res) => {
        try {
            const user_id = req.session.user?.id;
            if (!user_id) {
                return res.status(401).json({ message: 'Chưa đăng nhập' });
            }
            
            const { date } = req.query;
            if (!date) {
                return res.status(400).json({ message: 'Thiếu ngày.' });
            }

            const attendance = await Attendance.find({
                user_id: user_id,
                date: {
                    $gte: new Date(date + 'T00:00:00.000Z'),
                    $lt: new Date(date + 'T23:59:59.999Z')
                }
            }).sort({ date: -1 });

            // Transform for frontend compatibility
            const result = attendance.map(item => ({
                ...item.toObject(),
                id: item._id
            }));

            res.json(result);
        } catch (err) {
            console.error('getMyAttendanceByDate error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const getMyAttendanceByMonth = async (req, res) => {
        try {
            const user_id = req.session.user?.id;
            if (!user_id) {
                return res.status(401).json({ message: 'Chưa đăng nhập' });
            }
            
            const { year, month } = req.query;
            if (!year || !month) {
                return res.status(400).json({ message: 'Thiếu tháng hoặc năm.' });
            }

            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);

            const attendance = await Attendance.find({
                user_id: user_id,
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            }).sort({ date: -1 });

            // Transform for frontend compatibility
            const result = attendance.map(item => ({
                ...item.toObject(),
                id: item._id
            }));

            res.json(result);
        } catch (err) {
            console.error('getMyAttendanceByMonth error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const getFulltimeAttendanceByMonth = async (req, res) => {
        try {
            const { user_id, year, month } = req.query;
            
            if (!user_id || !year || !month) {
                return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
            }

            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);

            // For salary calculation, check WorkSchedule for fulltime employees
            const workSchedules = await WorkSchedule.find({
                user_id: user_id,
                work_date: {
                    $gte: startDate,
                    $lte: endDate
                }
            }).sort({ work_date: -1 });

            // Transform to expected format
            const attendance = workSchedules.map(schedule => ({
                date: schedule.work_date,
                check_in: schedule.work_date,
                check_out: schedule.work_date,
                note: `Ca ${schedule.shift_type} - ${schedule.start_time} đến ${schedule.end_time}`
            }));

            res.json(attendance);
        } catch (err) {
            console.error('getFulltimeAttendanceByMonth error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const getAdminAttendanceByMonth = async (req, res) => {
        try {
            const { user_id, year, month } = req.query;
            
            if (!user_id || !year || !month) {
                return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
            }

            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);

            const attendance = await Attendance.find({
                user_id: user_id,
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            }).sort({ date: -1 });

            res.json(attendance);
        } catch (err) {
            console.error('getAdminAttendanceByMonth error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const checkIn = async (req, res) => {
        try {
            const user_id = req.session.user?.id;
            if (!user_id) {
                return res.status(401).json({ message: 'Chưa đăng nhập' });
            }

            const { check_in, date } = req.body;
            if (!check_in || !date) {
                return res.status(400).json({ message: 'Thiếu thông tin chấm công' });
            }

            const targetDate = new Date(date);
            const checkInTime = new Date(check_in);

            // Check if already checked in for this date
            const existing = await Attendance.findOne({
                user_id: user_id,
                date: {
                    $gte: new Date(date + 'T00:00:00.000Z'),
                    $lt: new Date(date + 'T23:59:59.999Z')
                }
            });

            if (existing) {
                return res.status(400).json({ message: 'Đã chấm công ngày này rồi' });
            }

            // Determine shift type based on time
            const hour = checkInTime.getHours();
            const shift_type = hour >= 18 || hour < 6 ? 'night' : 'day';

            const newAttendance = new Attendance({
                user_id: user_id,
                date: targetDate,
                check_in: checkInTime,
                shift_type: shift_type,
                status: 'checked_in'
            });

            await newAttendance.save();

            // Transform for frontend compatibility
            const result = {
                ...newAttendance.toObject(),
                id: newAttendance._id
            };

            // Send notification and emit realtime event
            sendNotification(user_id, 'Chấm công vào ca thành công');
            
            // Emit new attendance event for dashboard
            io.emit('new_attendance', {
                userId: user_id,
                userName: req.session.user?.full_name || req.session.user?.username,
                type: 'check_in',
                shiftType: shift_type,
                date: targetDate,
                message: `${req.session.user?.full_name || req.session.user?.username} vừa chấm công vào ca ${shift_type === 'day' ? 'ngày' : 'đêm'}`,
                timestamp: new Date()
            });

            res.json({ message: 'Chấm công thành công', attendance: result });
        } catch (err) {
            console.error('checkIn error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const checkOut = async (req, res) => {
        try {
            const user_id = req.session.user?.id;
            if (!user_id) {
                return res.status(401).json({ message: 'Chưa đăng nhập' });
            }

            const { attendance_id, check_out, note } = req.body;
            if (!attendance_id || !check_out) {
                return res.status(400).json({ message: 'Thiếu thông tin chấm công' });
            }

            // Find attendance record
            const attendance = await Attendance.findOne({
                _id: attendance_id,
                user_id: user_id,
                status: 'checked_in'
            });

            if (!attendance) {
                return res.status(400).json({ message: 'Không tìm thấy bản ghi chấm công' });
            }

            const checkOutTime = new Date(check_out);
            
            // Calculate hours worked
            const hoursWorked = (checkOutTime - attendance.check_in) / (1000 * 60 * 60);

            attendance.check_out = checkOutTime;
            attendance.total_hours = Math.round(hoursWorked * 10) / 10; // Round to 1 decimal
            attendance.status = 'checked_out';
            attendance.note = note || '';

            // Calculate overtime (assuming 8 hours is standard)
            if (hoursWorked > 8) {
                attendance.overtime_hours = Math.round((hoursWorked - 8) * 10) / 10;
            }

            await attendance.save();

            // Send notification and emit realtime event
            sendNotification(user_id, 'Chấm công ra ca thành công');
            
            // Emit checkout event for dashboard
            io.emit('new_attendance', {
                userId: user_id,
                userName: req.session.user?.full_name || req.session.user?.username,
                type: 'check_out',
                totalHours: attendance.total_hours,
                overtimeHours: attendance.overtime_hours || 0,
                message: `${req.session.user?.full_name || req.session.user?.username} vừa chấm công ra ca (${attendance.total_hours}h)`,
                timestamp: new Date()
            });

            res.json({ message: 'Chấm công ra ca thành công', attendance });
        } catch (err) {
            console.error('checkOut error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const getMyAttendanceByWeek = async (req, res) => {
        try {
            const user_id = req.session.user?.id;
            if (!user_id) {
                return res.status(401).json({ message: 'Chưa đăng nhập' });
            }
            
            const { year, week } = req.query;
            if (!year || !week) {
                return res.status(400).json({ message: 'Thiếu tuần hoặc năm.' });
            }

            // Calculate week start and end dates
            const firstDayOfYear = new Date(year, 0, 1);
            const daysOffset = (parseInt(week) - 1) * 7;
            const startDate = new Date(firstDayOfYear);
            startDate.setDate(firstDayOfYear.getDate() + daysOffset);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);

            const attendance = await Attendance.find({
                user_id: user_id,
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            }).sort({ date: -1 });

            // Transform for frontend compatibility
            const result = attendance.map(item => ({
                ...item.toObject(),
                id: item._id
            }));

            res.json(result);
        } catch (err) {
            console.error('getMyAttendanceByWeek error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const getFulltimeAttendanceByDate = async (req, res) => {
        try {
            const user_id = req.session.user?.id;
            if (!user_id) {
                return res.status(401).json({ message: 'Chưa đăng nhập' });
            }
            
            const { date } = req.query;
            if (!date) {
                return res.status(400).json({ message: 'Thiếu ngày.' });
            }

            // For fulltime, check WorkSchedule
            const workSchedules = await WorkSchedule.find({
                user_id: user_id,
                work_date: {
                    $gte: new Date(date + 'T00:00:00.000Z'),
                    $lt: new Date(date + 'T23:59:59.999Z')
                }
            });

            // Transform for frontend compatibility
            const result = workSchedules.map(schedule => ({
                id: schedule._id,
                date: schedule.work_date,
                note: `Ca ${schedule.shift_type} - ${schedule.start_time} đến ${schedule.end_time}`
            }));

            res.json(result);
        } catch (err) {
            console.error('getFulltimeAttendanceByDate error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const getFulltimeAttendanceByWeek = async (req, res) => {
        try {
            const user_id = req.session.user?.id;
            if (!user_id) {
                return res.status(401).json({ message: 'Chưa đăng nhập' });
            }
            
            const { year, week } = req.query;
            if (!year || !week) {
                return res.status(400).json({ message: 'Thiếu tuần hoặc năm.' });
            }

            // Calculate week start and end dates
            const firstDayOfYear = new Date(year, 0, 1);
            const daysOffset = (parseInt(week) - 1) * 7;
            const startDate = new Date(firstDayOfYear);
            startDate.setDate(firstDayOfYear.getDate() + daysOffset);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);

            const workSchedules = await WorkSchedule.find({
                user_id: user_id,
                work_date: {
                    $gte: startDate,
                    $lte: endDate
                }
            }).sort({ work_date: -1 });

            // Transform for frontend compatibility
            const result = workSchedules.map(schedule => ({
                id: schedule._id,
                date: schedule.work_date,
                note: `Ca ${schedule.shift_type} - ${schedule.start_time} đến ${schedule.end_time}`
            }));

            res.json(result);
        } catch (err) {
            console.error('getFulltimeAttendanceByWeek error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const checkInShow = async (req, res) => {
        try {
            const user_id = req.session.user?.id;
            if (!user_id) {
                return res.status(401).json({ message: 'Chưa đăng nhập' });
            }

            const { date, note } = req.body;
            if (!date) {
                return res.status(400).json({ message: 'Thiếu ngày' });
            }

            // For fulltime employees, create a WorkSchedule entry
            const targetDate = new Date(date);

            // Check if already has show for this date
            const existing = await WorkSchedule.findOne({
                user_id: user_id,
                work_date: {
                    $gte: new Date(date + 'T00:00:00.000Z'),
                    $lt: new Date(date + 'T23:59:59.999Z')
                }
            });

            if (existing) {
                return res.status(400).json({ message: 'Đã chấm công show ngày này rồi' });
            }

            const newSchedule = new WorkSchedule({
                user_id: user_id,
                work_date: targetDate,
                shift_type: 'day', // Default to day shift for show
                start_time: '09:00',
                end_time: '17:00',
                total_hours: 8,
                status: 'completed'
            });

            await newSchedule.save();

            // Send notification and emit realtime event
            sendNotification(user_id, 'Chấm công show thành công');
            
            // Emit show check-in event
            io.emit('new_attendance', {
                userId: user_id,
                userName: req.session.user?.full_name || req.session.user?.username,
                type: 'check_in_show',
                date: targetDate,
                message: `${req.session.user?.full_name || req.session.user?.username} vừa chấm công show`,
                timestamp: new Date()
            });

            res.json({ message: 'Chấm công show thành công', schedule: newSchedule });
        } catch (err) {
            console.error('checkInShow error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const getMyDates = async (req, res) => {
        try {
            const user_id = req.session.user?.id;
            if (!user_id) {
                return res.status(401).json({ message: 'Chưa đăng nhập' });
            }

            // Get all dates where user has attendance records
            const attendance = await Attendance.find({ user_id: user_id }).select('date');
            const dates = attendance.map(item => item.date.toISOString().split('T')[0]);

            res.json(dates);
        } catch (err) {
            console.error('getMyDates error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    return {
        getMyAttendanceByDate,
        getMyAttendanceByMonth,
        getMyAttendanceByWeek,
        getFulltimeAttendanceByDate,
        getFulltimeAttendanceByMonth,
        getFulltimeAttendanceByWeek,
        getAdminAttendanceByMonth,
        checkIn,
        checkOut,
        checkInShow,
        getMyDates
    };
};