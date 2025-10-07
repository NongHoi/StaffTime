const express = require('express');
const router = express.Router();
const reportController = require('./reports.controller');
const requireLogin = require('../../middlewares/requireLogin');
const requireRole = require('../../middlewares/requireRole');

module.exports = () => {
    // Tất cả các route trong đây đều yêu cầu đăng nhập và có quyền Admin hoặc Manager
    router.use(requireLogin, requireRole([1, 2]));

    // Route cho báo cáo giờ làm
    router.get('/working-hours', reportController.getWorkingHoursReport);

    // Route cho báo cáo lương
    router.get('/payroll', reportController.getPayrollReport);

    return router;
};
