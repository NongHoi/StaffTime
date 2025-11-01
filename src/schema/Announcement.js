const mongoose = require('mongoose');
const { Schema } = mongoose;

const AnnouncementSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    author_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Empty array means all users
    target_users: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    read_by: [{
        user_id: { type: Schema.Types.ObjectId, ref: 'User' },
        read_at: { type: Date, default: Date.now }
    }],
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);
