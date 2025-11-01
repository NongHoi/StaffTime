const express = require('express');
const router = express.Router();
const userController = require('./users');
const requireLogin = require('../../middlewares/requireLogin');
const requireRole = require('../../middlewares/requireRole');
const WorkSchedule = require('../../schema/WorkSchedule');

module.exports = (io, connectedUsers) => {
    const controller = userController(io, connectedUsers);

    // Lấy ngày công theo tháng cho user bất kỳ (admin/manager)
    router.get('/attendance-by-month', async (req, res) => {
        try {
            const { user_id, year, month } = req.query;
            if (!user_id || !year || !month) {
                return res.status(400).json({ message: 'Thiếu thông tin.' });
            }

            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 1);

            const attendance = await WorkSchedule.find({
                user_id: user_id,
                work_date: {
                    $gte: startDate,
                    $lt: endDate
                }
            }).populate('user_id', 'full_name username');

            res.json(attendance);
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    });

    // Chỉ admin và manager mới được truy cập
    router.use(requireLogin, requireRole([1, 2]));

    router.get('/', controller.getUsers);
    router.put('/:userId/role', controller.changeRole);
    router.put('/:userId/type', controller.changeType);
    router.delete('/:userId', controller.removeUser);

    router.post('/set-salary', controller.setSalary);
    router.get('/:userId/salary', controller.getUserSalary);

    return router;
};
