const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const requireLogin = require('../middlewares/requireLogin');
const requireRole = require('../middlewares/requireRole');

// Chỉ manager và admin được lưu bảng lương
router.use(requireLogin, requireRole([1, 2]));

// Lưu bảng lương
router.post('/', payrollController.savePayroll);
// Lấy danh sách bảng lương đã lưu của 1 user
router.get('/user/:user_id', payrollController.getPayrollsByUser);
// Lấy chi tiết bảng lương theo id
router.get('/:id', payrollController.getPayrollById);

module.exports = router;
