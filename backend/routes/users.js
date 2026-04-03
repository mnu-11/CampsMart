const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const { protect } = require('../middleware/auth');

// @route GET /api/users/:id — public profile (anonymized)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name university avatar rating createdAt');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const itemCount = await Item.countDocuments({ sellerId: req.params.id, isSold: false, adminStatus: 'approved' });
    const soldCount = await Item.countDocuments({ sellerId: req.params.id, isSold: true });

    // Never expose email or _id to other users
    res.json({ success: true, user: { name: user.name, university: user.university, avatar: user.avatar, rating: user.rating, createdAt: user.createdAt }, stats: { itemCount, soldCount } });
  } catch (error) {
    if (error.name === 'CastError') return res.status(404).json({ success: false, message: 'User not found' });
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route GET /api/users/:id/items — public items by user
router.get('/:id/items', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const filter = { sellerId: req.params.id, isSold: false, adminStatus: 'approved' };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Item.countDocuments(filter);
    const items = await Item.find(filter)
      .select('title price images condition category createdAt adminRating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, items, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
