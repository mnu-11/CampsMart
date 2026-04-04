const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  collegeId: {
    type: String,
    trim: true,
    default: '',
  },
  collegeIdImage: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  university: {
    type: String,
    default: '',
    trim: true,
  },
  phone: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
    maxlength: [200, 'Bio cannot exceed 200 characters'],
  },
  upiId: {
    type: String,
    default: '',
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    select: false,
  },
  emailVerificationExpires: {
    type: Date,
    select: false,
  },
  otp: {
    type: String,
    select: false,
  },
  otpExpires: {
    type: Date,
    select: false,
  },
  isCollegeIdVerified: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
    },
    expiresAt: {
      type: Date,
    },
    listingsThisMonth: {
      type: Number,
      default: 0,
    },
    lastListingDate: {
      type: Date,
      default: Date.now,
    },
  },
  wallet: {
    balance: { type: Number, default: 0 },
    transactions: [
      {
        type: { type: String, enum: ['deposit', 'rental_lock', 'rental_refund', 'rental_deduction', 'commission'] },
        amount: Number,
        description: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.otp;
  delete obj.otpExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
