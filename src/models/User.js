const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  full_name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  role_id: {
    type: Number,
    required: true,
    enum: [1, 2, 3], // 1: Admin, 2: Manager, 3: Employee
    default: 3
  },
  hourly_salary: {
    type: Number,
    default: 0
  },
  salary_config: {
    type: {
      type: String,
      enum: ['parttime', 'fulltime'],
      default: 'parttime'
    },
    day_shift_rate: {
      type: Number,
      default: 0
    },
    night_shift_rate: {
      type: Number,
      default: 0
    },
    base_salary: {
      type: Number,
      default: 0
    },
    allowance: {
      type: Number,
      default: 0
    },
    bonus: {
      type: Number,
      default: 0
    },
    show_salary: {
      type: Number,
      default: 0
    }
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);