const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const { adminOnly } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

const sendAdminEmail = async (to, subject, html) => {
  try {
    await sendEmail(to, subject, html);
  } catch (e) {
    console.warn('Email warning:', e.message);
  }
};

// @route GET /api/admin/dashboard
router.get('/dashboard', adminOnly, async (req, res) => {
  try {
    const [totalUsers, pendingUsers, totalItems, soldItems, pendingItems, totalOrders, revenue] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', isApproved: false, isEmailVerified: true }),
      Item.countDocuments(),
      Item.countDocuments({ isSold: true }),
      Item.countDocuments({ adminStatus: 'pending' }),
      Order.countDocuments({ status: 'paid' }),
      Order.aggregate([{ $match: { status: { $in: ['paid', 'delivered'] } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);
    res.json({
      success: true,
      stats: {
        totalUsers, pendingUsers, totalItems, soldItems, pendingItems,
        totalOrders, revenue: revenue[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route GET /api/admin/users
router.get('/users', adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { role: 'user' };
    if (status === 'pending') { filter.isApproved = false; filter.isEmailVerified = true; }
    if (status === 'approved') filter.isApproved = true;
    if (status === 'unverified') filter.isEmailVerified = false;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    res.json({ success: true, users, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route GET /api/admin/users/inactive
router.get('/users/inactive', adminOnly, async (req, res) => {
  try {
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const users = await User.find({
      role: 'user',
      lastActive: { $lt: sixMonthsAgo }
    }).sort({ lastActive: 1 });
    
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route PATCH /api/admin/users/:id/approve
router.patch('/users/:id/approve', adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true, isCollegeIdVerified: true }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await Notification.create({
      type: 'account_approved',
      recipientId: user._id,
      message: 'Your account has been approved! You can now buy and sell on Campus Marketplace.',
    });

    await sendEmail(user.email, 'Your Campus Marketplace account is approved!', `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px;">
        <h2 style="color:#2563eb;">Campus Marketplace</h2>
        <h3>Account Approved! 🎉</h3>
        <p>Hi ${user.name}, your College ID has been verified and your account is now active.</p>
        <a href="${process.env.CLIENT_URL}/login" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Login Now</a>
      </div>
    `);

    res.json({ success: true, message: 'User approved', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route PATCH /api/admin/users/:id/reject
router.patch('/users/:id/reject', adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await sendEmail(user.email, 'Campus Marketplace Account — Action Required', `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px;">
        <h2 style="color:#ef4444;">Account Verification Issue</h2>
        <p>Hi ${user.name}, we could not verify your College ID.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>Please contact support or re-register with a valid College ID.</p>
      </div>
    `);

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User rejected and removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route PATCH /api/admin/users/:id/subscription
router.patch('/users/:id/subscription', adminOnly, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['free', 'premium'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.subscription.plan = plan;
    if (plan === 'premium') {
      user.subscription.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year if manual
    } else {
      user.subscription.expiresAt = null;
    }
    await user.save();

    await Notification.create({
      type: 'account_approved',
      recipientId: user._id,
      message: `Your account plan has been updated to ${plan.toUpperCase()} by an admin.`,
    });

    res.json({ success: true, message: `User plan updated to ${plan}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route GET /api/admin/items
router.get('/items', adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.adminStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Item.countDocuments(filter);
    const items = await Item.find(filter)
      .populate('sellerId', 'name email collegeId university')
      .populate('buyerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, items, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route PATCH /api/admin/items/:id/status
router.patch('/items/:id/status', adminOnly, async (req, res) => {
  try {
    const { status, adminNotes, adminRating } = req.body;
    const item = await Item.findById(req.params.id).populate('sellerId', 'name email');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const updates = { adminStatus: status };
    if (adminNotes) updates.adminNotes = adminNotes;
    if (adminRating) updates.adminRating = adminRating;
    if (status === 'received') updates.adminEmail = process.env.ADMIN_EMAIL || req.user.email;

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, updates, { new: true });

    // Notify seller
    const sellerMsg = {
      pending: 'Your item is pending admin review.',
      received: `Admin has received your item "${item.title}" for inspection.`,
      approved: `Great news! Your item "${item.title}" has been approved and listed for sale.`,
      rejected: `Your item "${item.title}" was not approved. ${adminNotes || ''}`,
    }[status];

    if (sellerMsg) {
      await Notification.create({
        type: status === 'approved' ? 'item_approved' : status === 'rejected' ? 'item_rejected' : 'item_received',
        recipientId: item.sellerId._id,
        itemId: item._id,
        message: sellerMsg,
      });
      await sendEmail(item.sellerId.email, `Item Update: ${item.title}`, `
        <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;background:#f9fafb;border-radius:12px;">
          <h2 style="color:#2563eb;">Campus Marketplace</h2>
          <p>${sellerMsg}</p>
          ${adminNotes ? `<p><strong>Admin notes:</strong> ${adminNotes}</p>` : ''}
          ${adminRating ? `<p><strong>Item rating:</strong> ${'⭐'.repeat(adminRating)}</p>` : ''}
          <a href="${process.env.CLIENT_URL}/my-items" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;margin-top:12px;">View My Items</a>
        </div>
      `);
    }

    res.json({ success: true, item: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route PATCH /api/admin/items/:id/rate
router.patch('/items/:id/rate', adminOnly, async (req, res) => {
  try {
    const { rating, notes } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
    }
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { adminRating: rating, adminNotes: notes || '', adminStatus: 'approved' },
      { new: true }
    ).populate('sellerId', 'name email');

    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    await Notification.create({
      type: 'item_rated',
      recipientId: item.sellerId._id,
      itemId: item._id,
      message: `Admin rated your item "${item.title}" — ${'⭐'.repeat(rating)} (${rating}/5). It is now approved for sale.`,
      metadata: { rating, notes },
    });

    await sendEmail(item.sellerId.email, `Your item has been rated: ${item.title}`, `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;background:#f9fafb;border-radius:12px;">
        <h2 style="color:#2563eb;">Item Rated & Approved</h2>
        <p>Your item <strong>${item.title}</strong> has been rated <strong>${rating}/5 ⭐</strong> by the admin and is now live for buyers!</p>
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        <a href="${process.env.CLIENT_URL}/my-items" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;margin-top:12px;">View My Items</a>
      </div>
    `);

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route DELETE /api/admin/items/:id
router.delete('/items/:id', adminOnly, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route GET /api/admin/orders
router.get('/orders', adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('itemId', 'title price images adminStatus')
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route GET /api/admin/notifications
router.get('/notifications', adminOnly, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .populate('senderId', 'name email')
      .populate('itemId', 'title images')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route PATCH /api/admin/notifications/read
router.patch('/notifications/read', adminOnly, async (req, res) => {
  try {
    await Notification.updateMany({ recipientId: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
