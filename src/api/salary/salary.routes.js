const express = require('express');
const router = express.Router();
const salaryController = require('./salary.controller');
const requireLogin = require('../../middlewares/requireLogin');
const requireRole = require('../../middlewares/requireRole');

// Chỉ manager và admin được tính lương cho nhân viên
router.use(requireLogin, requireRole([1, 2]));


const fulltimeSalaryController = require('./fulltimeSalary.controller');
router.post('/parttime', salaryController.calcParttimeSalary);
router.post('/fulltime', fulltimeSalaryController.calcFulltimeSalary);

module.exports = router;
