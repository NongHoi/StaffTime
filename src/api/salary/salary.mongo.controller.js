const User = require('../../schema/User');
const Attendance = require('../../schema/Attendance');
const WorkSchedule = require('../../schema/WorkSchedule');

module.exports = (io, connectedUsers) => {
    const calculatePartTimeSalary = async (req, res) => {
        try {
            const { user_id, month, year, allowance = 0, bonus = 0 } = req.body;

            if (!user_id || !month || !year) {
                return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
            }

            // Get user info
            const user = await User.findById(user_id);
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
            }

            // Get attendance data for the month
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);

            const attendanceRecords = await Attendance.find({
                user_id: user_id,
                date: {
                    $gte: startDate,
                    $lte: endDate
                },
                status: 'checked_out'
            });

            let totalDay = 0;
            let totalNight = 0;

            // Calculate day and night hours
            attendanceRecords.forEach(record => {
                if (record.shift_type === 'day') {
                    totalDay += record.total_hours || 0;
                } else if (record.shift_type === 'night') {
                    totalNight += record.total_hours || 0;
                }
            });

            // Get salary rates from user's salary_config
            const salaryConfig = user.salary_config || {};
            const dayShiftRate = salaryConfig.day_shift_rate || user.hourly_salary || 50000;
            const nightShiftRate = salaryConfig.night_shift_rate || (user.hourly_salary || 50000) * 1.5;

            // Debug logging
            console.log('=== SALARY CALCULATION DEBUG ===');
            console.log('User:', user.full_name);
            console.log('User salary_config:', salaryConfig);
            console.log('Day shift rate calculated:', dayShiftRate);
            console.log('Night shift rate calculated:', nightShiftRate);
            console.log('Total day hours:', totalDay);
            console.log('Total night hours:', totalNight);

            // Calculate total salary
            const dayPay = totalDay * dayShiftRate;
            const nightPay = totalNight * nightShiftRate;
            const total = dayPay + nightPay + Number(allowance) + Number(bonus);

            res.json({
                totalDay: totalDay.toFixed(1),
                totalNight: totalNight.toFixed(1),
                day_shift_rate: dayShiftRate,
                night_shift_rate: nightShiftRate,
                allowance: Number(allowance),
                bonus: Number(bonus),
                total: total
            });

        } catch (err) {
            console.error('calculatePartTimeSalary error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const calculateFullTimeSalary = async (req, res) => {
        try {
            const { user_id, month, year, allowance = 0, bonus = 0 } = req.body;

            if (!user_id || !month || !year) {
                return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
            }

            // Get user info
            const user = await User.findById(user_id);
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
            }

            // Get work schedule data for shows
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);

            const showRecords = await WorkSchedule.find({
                user_id: user_id,
                work_date: {
                    $gte: startDate,
                    $lte: endDate
                },
                status: 'completed'
            });

            // Get salary config for fulltime
            const salaryConfig = user.salary_config || {};
            const baseSalary = salaryConfig.base_salary || user.hourly_salary || 15000000; // Base salary per month
            const showSalary = salaryConfig.show_salary || 500000; // Per show
            const showCount = showRecords.length;
            const totalShowSalary = showCount * showSalary;
            const total = baseSalary + totalShowSalary + Number(allowance) + Number(bonus);

            res.json({
                base_salary: baseSalary,
                show_count: showCount,
                show_salary: showSalary,
                total_show_salary: totalShowSalary,
                allowance: Number(allowance),
                bonus: Number(bonus),
                total: total
            });

        } catch (err) {
            console.error('calculateFullTimeSalary error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    return {
        calculatePartTimeSalary,
        calculateFullTimeSalary
    };
};