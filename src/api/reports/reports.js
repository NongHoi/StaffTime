const User = require('../../schema/User');
const WorkSchedule = require('../../schema/WorkSchedule');
const Payroll = require('../../schema/Payroll');

// Lấy báo cáo giờ làm việc
exports.getWorkingHoursReport = async (req, res) => {
    const { period_type, year, month, week } = req.query;

    try {
        let matchStage = {};
        
        if (period_type === 'year' && year) {
            matchStage.work_date = {
                $gte: new Date(`${year}-01-01`),
                $lt: new Date(`${parseInt(year) + 1}-01-01`)
            };
        } else if (period_type === 'month' && year && month) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 1);
            matchStage.work_date = {
                $gte: startDate,
                $lt: endDate
            };
        } else if (period_type === 'week' && year && week) {
            // Calculate start and end of the week
            const startOfYear = new Date(year, 0, 1);
            const startOfWeek = new Date(startOfYear.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
            const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
            matchStage.work_date = {
                $gte: startOfWeek,
                $lt: endOfWeek
            };
        }

        const pipeline = [
            {
                $lookup: {
                    from: 'workschedules',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'work_schedules'
                }
            },
            {
                $unwind: {
                    path: '$work_schedules',
                    preserveNullAndEmptyArrays: true
                }
            }
        ];

        if (Object.keys(matchStage).length > 0) {
            pipeline.push({
                $match: {
                    'work_schedules.work_date': matchStage.work_date
                }
            });
        }

        pipeline.push(
            {
                $group: {
                    _id: '$_id',
                    full_name: { $first: '$full_name' },
                    total_normal_hours: {
                        $sum: {
                            $subtract: [
                                { $ifNull: ['$work_schedules.total_hours', 0] },
                                { $ifNull: ['$work_schedules.overtime_hours', 0] }
                            ]
                        }
                    },
                    total_overtime_hours: { $sum: { $ifNull: ['$work_schedules.overtime_hours', 0] } }
                }
            },
            {
                $sort: { full_name: 1 }
            }
        );

        const results = await User.aggregate(pipeline);
        res.json(results);
    } catch (error) {
        console.error('Error getting working hours report:', error);
        res.status(500).json({ message: 'Lỗi khi lấy báo cáo giờ làm.' });
    }
};

// Lấy báo cáo lương
exports.getPayrollReport = async (req, res) => {
    const { year } = req.query;

    if (!year) {
        return res.status(400).json({ message: 'Vui lòng cung cấp năm.' });
    }

    try {
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${parseInt(year) + 1}-01-01`);

        const pipeline = [
            {
                $match: {
                    pay_date: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$pay_date' },
                    total_payroll: { $sum: '$net_salary' }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ];

        const results = await Payroll.aggregate(pipeline);
        
        // Chuyển đổi kết quả thành định dạng dễ sử dụng hơn cho biểu đồ
        const monthlyData = Array(12).fill(0);
        results.forEach(result => {
            monthlyData[result._id - 1] = result.total_payroll;
        });

        res.json(monthlyData);
    } catch (error) {
        console.error('Error getting payroll report:', error);
        res.status(500).json({ message: 'Lỗi khi lấy báo cáo lương.' });
    }
};
