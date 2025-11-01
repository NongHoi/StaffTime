const mongoose = require('mongoose');

const workScheduleSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  work_date: {
    type: Date,
    required: true
  },
  shift_type: {
    type: String,
    enum: ['day', 'night'],
    required: true
  },
  start_time: {
    type: String, // Format: "HH:MM"
    required: true
  },
  end_time: {
    type: String, // Format: "HH:MM"
    required: true
  },
  total_hours: {
    type: Number,
    required: true
  },
  overtime_hours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'absent'],
    default: 'scheduled'
  },
  event_name: {
    type: String,
    trim: true,
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
workScheduleSchema.index({ user_id: 1, work_date: 1 });
workScheduleSchema.index({ work_date: 1 });

module.exports = mongoose.model('WorkSchedule', workScheduleSchema);