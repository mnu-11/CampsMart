const mongoose = require('mongoose');

const CATEGORIES = [
  'Books & Notes',
  'Electronics',
  'Bicycles & Transport',
  'Furniture',
  'Clothing',
  'Sports & Fitness',
  'Stationery',
  'Instruments',
  'Other',
];

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Display price is required'],
    min: [0],
  },
  sellerPrice: {
    type: Number,
    required: [true, 'Seller price is required'],
    min: [0],
  },
  commission: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: { values: CATEGORIES, message: 'Invalid category' },
  },
  images: [
    {
      url: { type: String, required: true },
      publicId: { type: String, default: '' },
    },
  ],
  condition: {
    type: String,
    enum: ['Like New', 'Good', 'Fair', 'For Parts'],
    default: 'Good',
  },
  tags: [{ type: String, trim: true }],
  location: {
    type: String,
    default: '',
    trim: true,
  },
  isSold: {
    type: Boolean,
    default: false,
  },
  isNegotiable: {
    type: Boolean,
    default: false,
  },
  views: {
    type: Number,
    default: 0,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Admin workflow fields
  adminStatus: {
    type: String,
    enum: ['pending', 'received', 'approved', 'rejected'],
    default: 'pending',
  },
  adminRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  adminNotes: {
    type: String,
    default: '',
  },
  adminEmail: {
    type: String,
    default: '',
  },
  // Payment
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  paymentStatus: {
    type: String,
    enum: ['none', 'pending', 'completed', 'refunded'],
    default: 'none',
  },
  paymentId: {
    type: String,
    default: '',
  },
  orderId: {
    type: String,
    default: '',
  },
  isPremiumPromotion: {
    type: Boolean,
    default: false,
  },
  isForRent: {
    type: Boolean,
    default: false,
  },
  rentPerDay: {
    type: Number,
    min: [0, 'Rent cannot be negative'],
    default: 0,
  },
  rentalStatus: {
    type: String,
    enum: ['available', 'rented', 'overdue'],
    default: 'available',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

itemSchema.pre('save', function (next) {
  if (this.sellerPrice && (!this.price || this.isModified('sellerPrice'))) {
    this.commission = Math.ceil(this.sellerPrice * 0.1); // Admin 10%
    this.price = this.sellerPrice + this.commission; // Final price
  }
  this.updatedAt = Date.now();
  next();
});

itemSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Item', itemSchema);
module.exports.CATEGORIES = CATEGORIES;
