const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  renterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  dailyRate: {
    type: Number,
    required: true,
  },
  totalFee: {
    type: Number,
    required: true,
  },
  lockedAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'returned', 'overdue', 'cancelled'],
    default: 'active',
  },
  returnDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Rental', rentalSchema);
