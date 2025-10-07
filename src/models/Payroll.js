const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pay_period_start: {
    type: Date,
    required: true
  },
  pay_period_end: {
    type: Date,
    required: true
  },
  regular_hours: {
    type: Number,
    default: 0
  },
  overtime_hours: {
    type: Number,
    default: 0
  },
  regular_pay: {
    type: Number,
    default: 0
  },
  overtime_pay: {
    type: Number,
    default: 0
  },
  gross_salary: {
    type: Number,
    required: true
  },
  deductions: {
    type: Number,
    default: 0
  },
  net_salary: {
    type: Number,
    required: true
  },
  pay_date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
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
payrollSchema.index({ user_id: 1, pay_date: 1 });
payrollSchema.index({ pay_date: 1 });

module.exports = mongoose.model('Payroll', payrollSchema);