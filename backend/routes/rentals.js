const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const User = require('../models/User');
const Rental = require('../models/Rental');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route POST /api/rentals/rent
// @desc Rent an item (Wallet Points)
router.post('/rent', protect, async (req, res) => {
  try {
    const { itemId, days } = req.body;
    if (!days || days < 1) return res.status(400).json({ success: false, message: 'Invalid duration' });

    const item = await Item.findById(itemId).populate('sellerId', 'name email');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (!item.isForRent) return res.status(400).json({ success: false, message: 'Item is not for rent' });
    if (item.rentalStatus !== 'available') return res.status(400).json({ success: false, message: 'Item is currently unavailable' });
    if (item.sellerId._id.toString() === req.user._id.toString()) return res.status(400).json({ success: false, message: 'Cannot rent your own item' });

    // Premium Check
    if (req.user.subscription?.plan !== 'premium') {
      return res.status(403).json({ success: false, message: 'Premium subscription required to rent items' });
    }

    const totalFee = item.rentPerDay * days;
    const user = await User.findById(req.user._id);

    if (user.wallet.balance < totalFee) {
      return res.status(400).json({ success: false, message: `Insufficient wallet balance. Total required: ₹${totalFee}` });
    }

    // Lock amount (or deduct as security)
    user.wallet.balance -= totalFee;
    user.wallet.transactions.push({
      type: 'rental_lock',
      amount: totalFee,
      description: `Rented "${item.title}" for ${days} days`,
    });
    await user.save();

    // Create rental
    const rental = await Rental.create({
      itemId: item._id,
      renterId: user._id,
      ownerId: item.sellerId._id,
      endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      dailyRate: item.rentPerDay,
      totalFee: totalFee,
      lockedAmount: totalFee,
      status: 'active',
    });

    // Update item
    item.rentalStatus = 'rented';
    await item.save();

    res.status(201).json({ success: true, message: 'Item rented successfully!', rental, balance: user.wallet.balance });
  } catch (error) {
    console.error('Rent error:', error);
    res.status(500).json({ success: false, message: 'Server error during rental' });
  }
});

// @route POST /api/rentals/:id/return
// @desc Return a rented item (Refund Points)
router.post('/:id/return', protect, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id).populate('itemId');
    if (!rental) return res.status(404).json({ success: false, message: 'Rental record not found' });
    if (rental.status !== 'active' && rental.status !== 'overdue') return res.status(400).json({ success: false, message: 'Item already returned' });

    // Points "returned" if on time (User requirement part)
    const user = await User.findById(rental.renterId);
    user.wallet.balance += rental.lockedAmount;
    user.wallet.transactions.push({
      type: 'rental_refund',
      amount: rental.lockedAmount,
      description: `Returned "${rental.itemId?.title || 'Item'}" - Refunded security points`,
    });
    await user.save();

    rental.status = 'returned';
    rental.returnDate = new Date();
    await rental.save();

    // Set item available
    if (rental.itemId) {
      const item = await Item.findById(rental.itemId._id);
      item.rentalStatus = 'available';
      await item.save();
    }

    res.json({ success: true, message: 'Item returned! Points refunded to wallet.', balance: user.wallet.balance });
  } catch (error) {
    console.error('Return error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route GET /api/rentals/my-rentals
router.get('/my-rentals', protect, async (req, res) => {
  try {
    const rentals = await Rental.find({ renterId: req.user._id }).populate('itemId').sort({ createdAt: -1 });
    res.json({ success: true, rentals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
