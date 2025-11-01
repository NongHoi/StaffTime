const mongoose = require('mongoose');

const legacyWorkScheduleSchema = new mongoose.Schema({
  date: {
    type: String, // Store as YYYY-MM-DD string for compatibility
    required: true
  },
  job_name: {
    type: String,
    required: true
  },
  start_time: {
    type: String, // Store as HH:MM string
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  note: {
    type: String,
    default: ''
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registrations: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    user_name: {
      type: String,
      required: true
    },
    registered_at: {
      type: Date,
      default: Date.now
    }
  }],
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

// Add virtual field for id (frontend compatibility)
legacyWorkScheduleSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

legacyWorkScheduleSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Index for efficient queries
legacyWorkScheduleSchema.index({ date: 1 });
legacyWorkScheduleSchema.index({ created_by: 1 });

module.exports = mongoose.model('LegacyWorkSchedule', legacyWorkScheduleSchema);