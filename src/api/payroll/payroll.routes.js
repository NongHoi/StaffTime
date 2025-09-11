const express = require('express');
const router = express.Router();
const payrollController = require('./payroll.controller');
const requireLogin = require('../../middlewares/requireLogin');
const requireRole = require('../../middlewares/requireRole');

module.exports = (io, connectedUsers) => {
    const controller = payrollController(io, connectedUsers);

    // Chỉ manager và admin được lưu bảng lương
    router.use(requireLogin, requireRole([1, 2]));

    // Lưu bảng lương
    router.post('/', controller.savePayroll);
    // Lấy danh sách bảng lương đã lưu của 1 user
    router.get('/user/:user_id', controller.getPayrollsByUser);
    // Lấy chi tiết bảng lương theo id
    router.get('/:id', controller.getPayrollById);

    return router;
};
