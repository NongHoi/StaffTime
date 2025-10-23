const mongoose = require('mongoose');

const materialIssuanceSchema = new mongoose.Schema({
  material_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  work_schedule_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LegacyWorkSchedule',
    required: true
  },
  quantity_issued: {
    type: Number,
    required: true,
    min: 1
  },
  issued_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issued_date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
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
materialIssuanceSchema.index({ material_id: 1 });
materialIssuanceSchema.index({ work_schedule_id: 1 });
materialIssuanceSchema.index({ issued_date: 1 });

module.exports = mongoose.model('MaterialIssuance', materialIssuanceSchema);