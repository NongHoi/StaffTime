const requestModel = require('./requests.model');
const userModel = require('../users/user.model');

module.exports = (io, connectedUsers) => {
    // Helper function to send notification
    const sendNotification = (userId, message) => {
        const socketId = connectedUsers[userId];
        if (socketId) {
            io.to(socketId).emit('notification', { message });
        }
    };

    // Tạo yêu cầu mới
    const createRequest = async (req, res) => {
        try {
            const user_id = req.session.user.id;
            const { request_type, start_date, end_date, reason } = req.body;
            const newRequest = await requestModel.createRequest({ user_id, request_type, start_date, end_date, reason });

            // Thông báo cho tất cả admin và manager
            const adminsAndManagers = await userModel.findAdminsAndManagers();
            const user = await userModel.findById(user_id);
            const message = `Nhân viên ${user.fullname || user.username} vừa tạo một yêu cầu nghỉ phép mới.`;
            
            adminsAndManagers.forEach(admin => {
                // Gửi thông báo real-time
                sendNotification(admin.id, message);
                // Có thể thêm logic gửi email/thông báo đẩy ở đây
            });
            
            // Gửi lại thông tin đầy đủ của request mới cho client (bao gồm cả thông tin user)
            const fullRequestInfo = await requestModel.getRequestById(newRequest.id);
            
            // Gửi sự kiện new_request đến các admin/manager đang kết nối
            adminsAndManagers.forEach(admin => {
                 const socketId = connectedUsers[admin.id];
                 if (socketId) {
                    io.to(socketId).emit('new_request', fullRequestInfo);
                 }
            });


            res.status(201).json(newRequest);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };

    // Cập nhật trạng thái yêu cầu
    const updateRequestStatus = async (req, res) => {
        try {
            const { id } = req.params;
            const { status, reviewer_comment } = req.body;
            const reviewed_by = req.session.user.id;
            const updatedRequest = await requestModel.updateRequestStatus(id, status, reviewed_by, reviewer_comment);

            // Gửi thông báo cho người tạo yêu cầu
            const message = `Yêu cầu nghỉ phép của bạn đã được ${status === 'approved' ? 'chấp thuận' : 'từ chối'}.`;
            sendNotification(updatedRequest.user_id, message);

            res.json(updatedRequest);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };

    // Lấy tất cả yêu cầu (cho admin/manager)
    const getAllRequests = async (req, res) => {
        try {
            const requests = await requestModel.getAllRequests();
            res.json(requests);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };

    // Lấy các yêu cầu của một user
    const getUserRequests = async (req, res) => {
        try {
            const user_id = req.session.user.id;
            const requests = await requestModel.getRequestsByUserId(user_id);
            res.json(requests);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };

    return {
        createRequest,
        updateRequestStatus,
        getAllRequests,
        getUserRequests,
    };
};
