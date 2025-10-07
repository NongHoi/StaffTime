const Request = require('../../models/Request');
const User = require('../../models/User');

module.exports = (io, connectedUsers) => {
    const sendNotification = (userId, message) => {
        const socketId = connectedUsers[userId];
        if (socketId) {
            io.to(socketId).emit('notification', { message });
        }
    };

    const createRequest = async (req, res) => {
        try {
            const user_id = req.session.user?.id;
            if (!user_id) {
                return res.status(401).json({ message: 'Chưa đăng nhập' });
            }

            // Support both old and new field names for compatibility
            const { 
                type, request_type, 
                reason, title, description,
                start_date, end_date, 
                note 
            } = req.body;

            const requestType = request_type || type;
            const requestTitle = title || reason || 'Yêu cầu từ nhân viên';
            const requestDescription = description || reason || note || '';

            if (!requestType) {
                return res.status(400).json({ message: 'Thiếu loại yêu cầu' });
            }

            // Validate request type
            if (!['leave', 'overtime', 'schedule_change'].includes(requestType)) {
                return res.status(400).json({ message: 'Loại yêu cầu không hợp lệ' });
            }

            // Validate dates if required
            let startDate, endDate;
            if (start_date) {
                startDate = new Date(start_date);
                if (isNaN(startDate.getTime())) {
                    return res.status(400).json({ message: 'Ngày bắt đầu không hợp lệ' });
                }
            }
            
            if (end_date) {
                endDate = new Date(end_date);
                if (isNaN(endDate.getTime())) {
                    return res.status(400).json({ message: 'Ngày kết thúc không hợp lệ' });
                }
            }

            // Create request with correct field names
            const request = new Request({
                user_id: user_id,
                request_type: requestType,
                title: requestTitle,
                description: requestDescription,
                start_date: startDate,
                end_date: endDate,
                status: 'pending'
            });

            await request.save();

            // Notify managers
            const managers = await User.find({ role_id: { $in: [1, 2] } });
            managers.forEach(manager => {
                sendNotification(manager._id.toString(), `Có yêu cầu mới từ ${req.session.user?.full_name || req.session.user?.username}: ${requestType}`);
            });

            // Emit dashboard event for new request
            io.emit('new_request', {
                requestId: request._id,
                userId: user_id,
                userName: req.session.user?.full_name || req.session.user?.username,
                type: request.request_type,
                title: requestTitle,
                message: `Yêu cầu ${request.request_type} mới từ ${req.session.user?.full_name || req.session.user?.username}`,
                timestamp: new Date()
            });

            // Update dashboard stats
            const pendingCount = await Request.countDocuments({ status: 'pending' });
            io.emit('dashboard_update', {
                pendingRequests: pendingCount
            });

            res.json({ 
                message: 'Tạo yêu cầu thành công', 
                request 
            });

        } catch (err) {
            console.error('createRequest error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const getMyRequests = async (req, res) => {
        try {
            const user_id = req.session.user?.id;
            if (!user_id) {
                return res.status(401).json({ message: 'Chưa đăng nhập' });
            }

            const requests = await Request.find({ user_id: user_id })
                .sort({ created_at: -1 });

            res.json(requests);

        } catch (err) {
            console.error('getMyRequests error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const getAllRequests = async (req, res) => {
        try {
            const requests = await Request.find()
                .populate('user_id', 'full_name username')
                .sort({ created_at: -1 });

            // Transform to match frontend expectations
            const transformedRequests = requests.map(request => ({
                ...request.toObject(),
                user: request.user_id ? {
                    id: request.user_id._id,
                    fullname: request.user_id.full_name,
                    username: request.user_id.username
                } : null
            }));

            res.json(transformedRequests);

        } catch (err) {
            console.error('getAllRequests error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const updateRequestStatus = async (req, res) => {
        try {
            const { id } = req.params;
            const { status, response_note, manager_comment } = req.body;
            const approved_by = req.session.user?.id;

            // Use the comment from either field name
            const comment = manager_comment || response_note || '';

            const updateData = { 
                status,
                updated_at: new Date()
            };

            // Add comment if provided
            if (comment) {
                updateData.manager_comment = comment;
            }

            // Add approval info if approved
            if (status === 'approved' && approved_by) {
                updateData.approved_by = approved_by;
                updateData.approved_at = new Date();
            }

            const request = await Request.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            ).populate('user_id', 'full_name username');

            if (!request) {
                return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
            }

            const statusText = status === 'approved' ? 'đã được chấp thuận' : 
                               status === 'rejected' ? 'đã bị từ chối' : 'đang xử lý';

            // Send notification to request owner
            if (request.user_id && request.user_id._id) {
                const userId = request.user_id._id.toString();
                sendNotification(userId, `Yêu cầu ${request.request_type} của bạn ${statusText}`);
                
                // Emit specific event based on status
                if (status === 'approved') {
                    const socketId = connectedUsers[userId];
                    if (socketId) {
                        io.to(socketId).emit('request_approved', {
                            requestId: request._id,
                            type: request.request_type,
                            title: request.title,
                            status: status,
                            comment: comment,
                            message: `Yêu cầu ${request.request_type} của bạn ${statusText}`,
                            timestamp: new Date()
                        });
                    }
                } else if (status === 'rejected') {
                    const socketId = connectedUsers[userId];
                    if (socketId) {
                        io.to(socketId).emit('request_rejected', {
                            requestId: request._id,
                            type: request.request_type,
                            title: request.title,
                            status: status,
                            comment: comment,
                            message: `Yêu cầu ${request.request_type} của bạn ${statusText}`,
                            timestamp: new Date()
                        });
                    }
                }
            }

            // Emit dashboard event for request status update
            io.emit('request_status_update', {
                requestId: request._id,
                userId: request.user_id?._id,
                userName: request.user_id?.full_name || request.user_id?.username,
                status: status,
                type: request.request_type,
                message: `Yêu cầu ${request.request_type} của ${request.user_id?.full_name || request.user_id?.username} ${statusText}`,
                timestamp: new Date()
            });

            // Update dashboard stats
            const pendingCount = await Request.countDocuments({ status: 'pending' });
            io.emit('dashboard_update', {
                pendingRequests: pendingCount
            });

            res.json({ 
                message: 'Cập nhật trạng thái yêu cầu thành công', 
                request 
            });

        } catch (err) {
            console.error('updateRequestStatus error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    return {
        createRequest,
        getMyRequests,
        getAllRequests,
        updateRequestStatus
    };
};