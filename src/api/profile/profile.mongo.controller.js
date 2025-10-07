const User = require('../../models/User');

module.exports = (io, connectedUsers) => {
    const getProfile = async (req, res) => {
        try {
            const user_id = req.session.user?.id;
            if (!user_id) {
                return res.status(401).json({ message: 'Chưa đăng nhập' });
            }

            const user = await User.findById(user_id, '-password');
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy user' });
            }

            // Transform to match frontend expectations
            const profile = {
                ...user.toObject(),
                id: user._id,
                fullname: user.full_name
            };

            res.json(profile);
        } catch (err) {
            console.error('getProfile error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    const updateProfile = async (req, res) => {
        try {
            const user_id = req.session.user?.id;
            if (!user_id) {
                return res.status(401).json({ message: 'Chưa đăng nhập' });
            }

            const { fullname, phone, email, bank_account_number, bank_name } = req.body;

            const updatedUser = await User.findByIdAndUpdate(
                user_id,
                {
                    full_name: fullname,
                    phone,
                    email,
                    bank_account_number,
                    bank_name
                },
                { new: true, select: '-password' }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: 'Không tìm thấy user' });
            }

            // Update session data
            req.session.user.fullname = updatedUser.full_name;

            res.json({ message: 'Cập nhật thông tin thành công', user: updatedUser });
        } catch (err) {
            console.error('updateProfile error:', err);
            res.status(500).json({ message: err.message || 'Lỗi server' });
        }
    };

    return {
        getProfile,
        updateProfile
    };
};