const Announcement = require('../../models/Announcement');
const User = require('../../models/User');

module.exports = (io, connectedUsers) => {

    const sendNotification = (userId, message, title = 'Thông báo') => {
        const socketId = connectedUsers[userId];
        if (socketId) {
            io.to(socketId).emit('notification', { title, message });
        }
    };

    const createAnnouncement = async (req, res) => {
        try {
            const { title, message, target_users } = req.body;
            const author_id = req.session.user.id;

            const announcement = new Announcement({
                title,
                message,
                author_id,
                target_users: target_users || [] // Empty array for all users
            });

            await announcement.save();

            // Notify target users
            if (target_users && target_users.length > 0) {
                target_users.forEach(userId => {
                    sendNotification(userId, message, title);
                });
            } else {
                // Notify all users
                io.emit('new_announcement', {
                    _id: announcement._id,
                    title: announcement.title,
                    message: announcement.message,
                    created_at: announcement.created_at
                });
            }

            res.status(201).json({ message: 'Tạo thông báo thành công', announcement });

        } catch (error) {
            console.error("Create Announcement Error:", error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    };

    const getAnnouncements = async (req, res) => {
        try {
            const userId = req.session.user.id;
            const userRole = req.session.user.role_id;

            let announcements;
            if (userRole === 1 || userRole === 2) { // Admin/Manager gets all
                announcements = await Announcement.find().sort({ created_at: -1 }).populate('author_id', 'full_name');
            } else { // Regular user gets unread announcements
                announcements = await Announcement.find({
                    $and: [
                        { 'read_by.user_id': { $ne: userId } }, // Not read by this user
                        {
                            $or: [
                                { target_users: { $size: 0 } }, // Public announcement
                                { target_users: userId } // Targeted to this user
                            ]
                        }
                    ]
                }).sort({ created_at: -1 }).populate('author_id', 'full_name');
            }

            res.json(announcements);

        } catch (error) {
            console.error("Get Announcements Error:", error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    };

    const getAnnouncementHistory = async (req, res) => {
        try {
            const userId = req.session.user.id;

            const announcements = await Announcement.find({
                $or: [
                    { target_users: { $size: 0 } }, // Public announcement
                    { target_users: userId } // Targeted to this user
                ]
            })
            .sort({ created_at: -1 })
            .populate('author_id', 'full_name');

            // Add a 'read' status to each announcement for the current user
            const announcementsWithStatus = announcements.map(ann => {
                const isRead = ann.read_by.some(reader => reader.user_id.toString() === userId);
                return { ...ann.toObject(), isRead };
            });

            res.json(announcementsWithStatus);

        } catch (error) {
            console.error("Get Announcement History Error:", error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    };

    const markAsRead = async (req, res) => {
        try {
            const announcementId = req.params.id;
            const userId = req.session.user.id;

            const result = await Announcement.updateOne(
                { _id: announcementId, 'read_by.user_id': { $ne: userId } },
                { $push: { read_by: { user_id: userId } } }
            );

            if (result.nModified === 0) {
                return res.status(200).json({ message: 'Thông báo đã được đánh dấu đọc trước đó.' });
            }

            res.status(200).json({ message: 'Đã đánh dấu là đã đọc' });

        } catch (error) {
            console.error("Mark as Read Error:", error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    };


    return {
        createAnnouncement,
        getAnnouncements,
        getAnnouncementHistory,
        markAsRead
    };
};
