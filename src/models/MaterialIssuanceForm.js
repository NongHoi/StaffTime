const mongoose = require('mongoose');

const materialItemSchema = new mongoose.Schema({
  material_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
}, { _id: false });

const materialIssuanceFormSchema = new mongoose.Schema({
  work_schedule_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LegacyWorkSchedule',
    required: true
  },
  issued_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: {
    type: [materialItemSchema],
    required: true,
    validate: v => Array.isArray(v) && v.length > 0
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['issued', 'returned'],
    default: 'issued'
  },
  return_info: {
    returned_items: [{
      material_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material'
      },
      quantity_returned: Number
    }],
    lost_items: [{
      material_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material'
      },
      quantity_lost: Number,
      reason: String
    }],
    returned_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    returned_at: Date,
    notes: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

materialIssuanceFormSchema.index({ work_schedule_id: 1 });

module.exports = mongoose.model('MaterialIssuanceForm', materialIssuanceFormSchema);
