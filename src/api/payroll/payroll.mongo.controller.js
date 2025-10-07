const Payroll = require('../../models/Payroll');
const User = require('../../models/User');

module.exports = (io, connectedUsers) => {
    const sendNotification = (userId, message) => {
        const socketId = connectedUsers[userId];
        if (socketId) {
            io.to(socketId).emit('notification', { message });
        }
    };

    const createPayroll = async (req, res) => {
        try {
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
                return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
            }

            // Check if payroll already exists for this user and month
            const existing = await Payroll.findOne({
                user_id: user_id,
                pay_period_start: new Date(year, month - 1, 1)
            });

            if (existing) {
                return res.status(400).json({ message: 'Bảng lương tháng này đã tồn tại' });
            }

            const regularPay = (total_day * day_shift_rate) + (total_night * night_shift_rate);
            const grossSalary = regularPay + allowance + bonus;
            const deductions = grossSalary * 0.1; // 10% tax/insurance
            const netSalary = grossSalary - deductions;

            const payroll = new Payroll({
                user_id: user_id,
                pay_period_start: new Date(year, month - 1, 1),
                pay_period_end: new Date(year, month, 0),
                regular_hours: total_day + total_night,
                overtime_hours: 0,
                regular_pay: regularPay,
                overtime_pay: 0,
                gross_salary: grossSalary,
                deductions: deductions,
                net_salary: netSalary,
                pay_date: new Date(),
                status: 'pending'
            });

            await payroll.save();

            sendNotification(user_id, `Bảng lương tháng ${month}/${year} đã được tạo`);

            res.json({ 
                message: 'Tạo bảng lương thành công', 
                payroll 
            });

        } catch (err) {
            console.error('createPayroll error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
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