const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, optionalAuth, adminOnly } = require('../middleware/auth');
const { upload, cloudinary } = require('../middleware/upload');

// Helper: notify admin when new item listed
const notifyAdminsNewItem = async (item, seller) => {
  try {
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        type: 'new_item',
        recipientId: admin._id,
        senderId: seller._id,
        itemId: item._id,
        message: `New item listed: "${item.title}" by ${seller.name} (${seller.email}). Price: ₹${item.price}. Please review and rate it.`,
        metadata: { itemId: item._id, price: item.price, category: item.category },
      });
    }
  } catch (e) {
    console.error('notifyAdmins error:', e);
  }
};

// @route GET /api/items
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, condition, sortBy = 'createdAt', order = 'desc', page = 1, limit = 12, seller } = req.query;

    // Only show approved items to public
    const filter = { isSold: false, adminStatus: 'approved' };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (category && category !== 'All') filter.category = category;
    if (condition) filter.condition = condition;
    if (seller) filter.sellerId = seller;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Item.countDocuments(filter);
    const items = await Item.find(filter)
      .populate('sellerId', 'name avatar university rating subscription')
      .sort({ isPremiumPromotion: -1, [sortBy]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit));

    // Hide seller _id from non-admin public view
    const sanitizedItems = items.map(i => {
      const obj = i.toObject();
      if (obj.sellerId) {
        delete obj.sellerId.email; // hide email
      }
      return obj;
    });

    res.json({ success: true, items: sanitizedItems, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)), limit: Number(limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route GET /api/items/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('sellerId', 'name avatar university rating createdAt');

    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    await Item.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    const obj = item.toObject();
    // Hide seller identity from buyers (not premium, admin or owner)
    const isOwner = req.user && item.sellerId._id.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    const isPremium = req.user && req.user.subscription?.plan === 'premium';

    if (!isOwner && !isAdmin && !isPremium) {
      delete obj.sellerId._id;
      delete obj.sellerId.email;
      delete obj.sellerId.phone; // Ensure phone is also hidden
      delete obj.buyerId;
    }

    res.json({ success: true, item: obj });
  } catch (error) {
    if (error.name === 'CastError') return res.status(404).json({ success: false, message: 'Item not found' });
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route POST /api/items
router.post('/', protect, upload.array('images', 5), [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price').isNumeric().isFloat({ min: 0 }).withMessage('Valid price required'),
  body('category').notEmpty().withMessage('Category is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    if (!req.user.isApproved) {
      return res.status(403).json({ success: false, message: 'Your account must be approved to list items' });
    }

    // Check subscription limits for Free users
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const now = new Date();
    const isNewMonth = !user.subscription.lastListingDate || 
                       user.subscription.lastListingDate.getMonth() !== now.getMonth() ||
                       user.subscription.lastListingDate.getFullYear() !== now.getFullYear();

    if (isNewMonth) {
      user.subscription.listingsThisMonth = 0;
    }

    if (user.subscription.plan === 'free' && user.subscription.listingsThisMonth >= 5) {
      return res.status(403).json({ 
        success: false, 
        message: 'Monthly limit reached (5 listings for Free plan). Upgrade to Premium for unlimited listings!' 
      });
    }

    const { title, description, price, category, condition, location, isNegotiable, tags, isForRent, rentPerDay } = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(f => ({ url: f.path || f.secure_url || '', publicId: f.filename || f.public_id || '' }));
    }
    if (req.body.imageBase64) {
      const base64Images = Array.isArray(req.body.imageBase64) ? req.body.imageBase64 : [req.body.imageBase64];
      images = base64Images.map(url => ({ url, publicId: '' }));
    }

    const item = await Item.create({
      title, description,
      sellerPrice: Number(price), // Triggers 10% markup
      category,
      condition: condition || 'Good',
      location: location || '',
      isNegotiable: isNegotiable === 'true' || isNegotiable === true,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      images,
      sellerId: req.user._id,
      adminStatus: 'pending',
      isForRent: isForRent === 'true' || isForRent === true,
      rentPerDay: Number(rentPerDay) || 0,
    });

    await item.populate('sellerId', 'name email avatar university subscription');

    // Update user listing count
    user.subscription.listingsThisMonth += 1;
    user.subscription.lastListingDate = now;
    if (user.subscription.plan === 'premium') {
      item.isPremiumPromotion = true;
      await item.save();
    }
    await user.save();

    // Notify admin
    await notifyAdminsNewItem(item, req.user);

    res.status(201).json({ success: true, item, message: 'Item submitted for admin review' });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ success: false, message: 'Server error creating item' });
  }
});

// @route PUT /api/items/:id
router.put('/:id', protect, upload.array('images', 5), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (item.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updates = { ...req.body };
    if (req.files && req.files.length > 0) {
      updates.images = req.files.map(f => ({ url: f.path || f.secure_url || '', publicId: f.filename || f.public_id || '' }));
    }
    if (updates.price) updates.price = Number(updates.price);
    if (updates.tags && typeof updates.tags === 'string') updates.tags = updates.tags.split(',').map(t => t.trim());

    // Reset admin status if seller edits
    if (req.user.role !== 'admin') {
      updates.adminStatus = 'pending';
      updates.adminRating = null;
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('sellerId', 'name email avatar university');

    res.json({ success: true, item: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route DELETE /api/items/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (item.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    for (const img of item.images) {
      if (img.publicId) {
        try { await cloudinary.uploader.destroy(img.publicId); } catch (e) { console.warn('Cloudinary:', e.message); }
      }
    }
    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route PATCH /api/items/:id/sold
router.patch('/:id/sold', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (item.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    item.isSold = !item.isSold;
    await item.save();
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Seller's own items (including unapproved)
router.get('/my/all', protect, async (req, res) => {
  try {
    const items = await Item.find({ sellerId: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
