const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  check_in: {
    type: Date,
    required: true
  },
  check_out: {
    type: Date,
    default: null
  },
  total_hours: {
    type: Number,
    default: 0
  },
  overtime_hours: {
    type: Number,
    default: 0
  },
  shift_type: {
    type: String,
    enum: ['day', 'night'],
    default: 'day'
  },
  status: {
    type: String,
    enum: ['checked_in', 'checked_out', 'absent'],
    default: 'checked_in'
  },
  note: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for efficient queries
attendanceSchema.index({ user_id: 1, date: 1 });
attendanceSchema.index({ date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);