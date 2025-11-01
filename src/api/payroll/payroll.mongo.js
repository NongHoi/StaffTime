const Payroll = require('../../schema/Payroll');
const User = require('../../schema/User');

module.exports = (io, connectedUsers) => {
    const sendNotification = (userId, message) => {
        const socketId = connectedUsers[userId];
        if (socketId) {
            io.to(socketId).emit('notification', { message });
        }
    };

    const createPayroll = async (req, res) => {
        try {
            console.log('createPayroll received data:', req.body);
            
            const { 
                user_id, 
                month, 
                year, 
                total_day = 0, 
                total_night = 0, 
                day_shift_rate = 0, 
                night_shift_rate = 0, 
                allowance = 0, 
                bonus = 0, 
                total 
            } = req.body;

            if (!user_id || !month || !year) {
                return res.status(400).json({ message: 'Thiếu thông tin bắt buộc: user_id, month, year' });
            }

            if (!total && total !== 0) {
                return res.status(400).json({ message: 'Thiếu thông tin tổng lương' });
            }

            // Check if payroll already exists for this user and month
            const startOfMonth = new Date(year, month - 1, 1);
            const endOfMonth = new Date(year, month, 0);
            
            const existing = await Payroll.findOne({
                user_id: user_id,
                pay_period_start: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }
            });

            if (existing) {
                return res.status(400).json({ message: `Bảng lương tháng ${month}/${year} đã tồn tại` });
            }

            // Calculate values
            const regularPay = (Number(total_day) * Number(day_shift_rate)) + (Number(total_night) * Number(night_shift_rate));
            const totalAllowanceBonus = Number(allowance) + Number(bonus);
            const grossSalary = regularPay + totalAllowanceBonus;
            const deductions = Math.round(grossSalary * 0.1); // 10% tax/insurance  
            const netSalary = grossSalary - deductions;

            const payroll = new Payroll({
                user_id: user_id,
                pay_period_start: startOfMonth,
                pay_period_end: endOfMonth,
                // Legacy fields for frontend compatibility
                month: Number(month),
                year: Number(year),
                total_day: Number(total_day),
                total_night: Number(total_night),
                day_shift_rate: Number(day_shift_rate),
                night_shift_rate: Number(night_shift_rate),
                allowance: Number(allowance),
                bonus: Number(bonus),
                total: Number(total),
                // Standard payroll fields
                regular_hours: Number(total_day) + Number(total_night),
                overtime_hours: 0,
                regular_pay: regularPay,
                overtime_pay: 0,
                gross_salary: Number(total) || grossSalary,
                deductions: deductions,
                net_salary: Number(total) ? (Number(total) - deductions) : netSalary,
                pay_date: new Date(),
                status: 'pending'
            });

            await payroll.save();
            console.log('Payroll saved successfully:', payroll._id);

            // Send notification
            try {
                sendNotification(user_id, `Bảng lương tháng ${month}/${year} đã được tạo`);
            } catch (notifError) {
                console.error('Notification error:', notifError);
                // Don't fail the request if notification fails
            }

            res.json({ 
                message: 'Lưu bảng lương thành công', 
                payroll 
            });

        } catch (err) {
            console.error('createPayroll error:', err);
            if (err.code === 11000) {
                res.status(400).json({ message: 'Bảng lương đã tồn tại' });
            } else {
                res.status(500).json({ message: err.message || 'Lỗi server khi lưu bảng lương' });
            }
        }
    };

    const getUserPayrolls = async (req, res) => {
        try {
            const { userId } = req.params;
            
            const payrolls = await Payroll.find({ user_id: userId })
                .sort({ pay_period_start: -1 });

            res.json(payrolls);

        } catch (err) {
            console.error('getUserPayrolls error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const getAllPayrolls = async (req, res) => {
        try {
            const payrolls = await Payroll.find()
                .populate('user_id', 'full_name username')
                .sort({ pay_period_start: -1 });

            // Transform to match frontend expectations
            const transformedPayrolls = payrolls.map(payroll => ({
                ...payroll.toObject(),
                user: payroll.user_id ? {
                    id: payroll.user_id._id,
                    fullname: payroll.user_id.full_name,
                    username: payroll.user_id.username
                } : null
            }));

            res.json(transformedPayrolls);

        } catch (err) {
            console.error('getAllPayrolls error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const updatePayrollStatus = async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const payroll = await Payroll.findByIdAndUpdate(
                id,
                { status, pay_date: status === 'paid' ? new Date() : undefined },
                { new: true }
            ).populate('user_id', 'full_name');

            if (!payroll) {
                return res.status(404).json({ message: 'Không tìm thấy bảng lương' });
            }

            sendNotification(payroll.user_id._id, `Trạng thái bảng lương đã được cập nhật: ${status}`);

            res.json({ 
                message: 'Cập nhật trạng thái thành công', 
                payroll 
            });

        } catch (err) {
            console.error('updatePayrollStatus error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    return {
        createPayroll,
        getUserPayrolls,
        getAllPayrolls,
        updatePayrollStatus
    };
};