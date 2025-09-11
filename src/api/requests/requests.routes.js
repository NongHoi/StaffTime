const express = require('express');
const router = express.Router();
const requestController = require('./requests.controller');
const requireLogin = require('../../middlewares/requireLogin');
const requireRole = require('../../middlewares/requireRole');

module.exports = (io, connectedUsers) => {
    const controller = requestController(io, connectedUsers);

    // Áp dụng middleware đăng nhập cho tất cả các route
    router.use(requireLogin);

    // Lấy tất cả yêu cầu (chỉ admin/manager)
    router.get('/', requireRole([1, 2]), controller.getAllRequests);
    
    // Lấy các yêu cầu của chính user đang đăng nhập
    router.get('/my-requests', controller.getUserRequests);

    // Tạo yêu cầu mới
    router.post('/', controller.createRequest);

    // Cập nhật trạng thái yêu cầu (chỉ admin/manager)
    router.put('/:id/status', requireRole([1, 2]), controller.updateRequestStatus);

    return router;
};
