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

            const { type, reason, start_date, end_date, note } = req.body;

            if (!type || !reason) {
                return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
            }

            const request = new Request({
                user_id: user_id,
                type: type,
                reason: reason,
                start_date: start_date ? new Date(start_date) : undefined,
                end_date: end_date ? new Date(end_date) : undefined,
                note: note,
                status: 'pending'
            });

            await request.save();

            // Notify managers
            const managers = await User.find({ role_id: { $in: [1, 2] } });
            managers.forEach(manager => {
                sendNotification(manager._id, `Có yêu cầu mới từ nhân viên: ${type}`);
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
            const { status, response_note } = req.body;

            const request = await Request.findByIdAndUpdate(
                id,
                { 
                    status, 
                    response_note,
                    response_date: new Date()
                },
                { new: true }
            ).populate('user_id', 'full_name');

            if (!request) {
                return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
            }

            const statusText = status === 'approved' ? 'đã được chấp thuận' : 
                               status === 'rejected' ? 'đã bị từ chối' : 'đang xử lý';

            sendNotification(request.user_id._id, `Yêu cầu của bạn ${statusText}`);

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