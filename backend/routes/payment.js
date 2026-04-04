const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Item = require('../models/Item');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID.trim(),
  key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
});

const sendPaymentEmail = async (to, subject, html) => {
  try {
    await sendEmail(to, subject, html);
  } catch (e) {
    console.warn('Email warning:', e.message);
  }
};

// @route POST /api/payment/create-order
router.post('/create-order', protect, async (req, res) => {
  try {
    const { itemId } = req.body;
    const item = await Item.findById(itemId).populate('sellerId', 'name email');

    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (item.isSold) return res.status(400).json({ success: false, message: 'Item already sold' });
    if (item.adminStatus !== 'approved') {
      return res.status(400).json({ success: false, message: 'Item is not yet approved by admin for sale' });
    }
    if (item.sellerId._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot buy your own item' });
    }

    const amountInPaise = Math.round(item.price * 100);

    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: { itemId: itemId, buyerId: req.user._id.toString() },
    });

    const order = await Order.create({
      itemId,
      buyerId: req.user._id,
      sellerId: item.sellerId._id,
      amount: item.price,
      currency: 'INR',
      razorpayOrderId: razorpayOrder.id,
      adminEmail: process.env.ADMIN_EMAIL || '',
      status: 'created',
    });

    res.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderId: order._id,
      },
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Payment initialization failed' });
  }
});

// @route POST /api/payment/verify
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status: 'paid',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      { new: true }
    ).populate('itemId').populate('buyerId', 'name email').populate('sellerId', 'name email');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Mark item as sold with buyer info
    await Item.findByIdAndUpdate(order.itemId._id, {
      isSold: true,
      buyerId: req.user._id,
      paymentStatus: 'completed',
      paymentId: razorpay_payment_id,
    });

    // Notify admin & Credit Commission
    const admins = await User.find({ role: 'admin' });
    const commissionAmt = order.itemId.commission || Math.ceil(order.amount * 0.09); // Fallback: 9% approx of display price if old item

    for (const admin of admins) {
      // Add balance to admin wallet as commission earnings
      admin.wallet.balance += commissionAmt;
      admin.wallet.transactions.push({
        type: 'commission',
        amount: commissionAmt,
        description: `Commission earned from sale: ${order.itemId.title}`,
      });
      await admin.save();

      await Notification.create({
        type: 'payment_success',
        recipientId: admin._id,
        itemId: order.itemId._id,
        senderId: req.user._id,
        message: `Payment received! Buyer ${order.buyerId.name} paid ₹${order.amount}. Your commission: ₹${commissionAmt}.`,
        metadata: { orderId: order._id, amount: order.amount, commission: commissionAmt },
      });
    }

    // Email admin
    if (process.env.ADMIN_EMAIL) {
      await sendEmail(process.env.ADMIN_EMAIL, `Payment Received: ${order.itemId.title}`, `
        <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;background:#f9fafb;border-radius:12px;">
          <h2 style="color:#10b981;">Payment Received ✅</h2>
          <p><strong>Item:</strong> ${order.itemId.title}</p>
          <p><strong>Amount:</strong> ₹${order.amount}</p>
          <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
          <p>Please arrange delivery of the item to the buyer. The item is currently in your possession.</p>
          <a href="${process.env.CLIENT_URL}/admin/orders" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;margin-top:12px;">Manage Orders</a>
        </div>
      `);
    }

    // Email buyer confirmation
    await sendEmail(order.buyerId.email, `Purchase Confirmed: ${order.itemId.title}`, `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;background:#f9fafb;border-radius:12px;">
        <h2 style="color:#2563eb;">Purchase Confirmed!</h2>
        <p>Hi ${order.buyerId.name}, your payment of <strong>₹${order.amount}</strong> for <strong>${order.itemId.title}</strong> was successful.</p>
        <p>The admin will process your delivery shortly. You'll be contacted at this email.</p>
        <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
      </div>
    `);

    // Notify buyer
    await Notification.create({
      type: 'payment_success',
      recipientId: req.user._id,
      itemId: order.itemId._id,
      message: `Payment successful! You purchased "${order.itemId.title}" for ₹${order.amount}. Admin will contact you for delivery.`,
    });

    res.json({ success: true, message: 'Payment verified successfully', order });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Server error during payment verification' });
  }
});

// @route GET /api/payment/key
router.get('/key', protect, (req, res) => {
  res.json({ success: true, key: process.env.RAZORPAY_KEY_ID });
});

// @route POST /api/payment/create-subscription-order
router.post('/create-subscription-order', protect, async (req, res) => {
  try {
    const amount = 50; // ₹50 for Premium
    const amountInPaise = amount * 100;
    
    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `sub_${Date.now()}`,
      notes: { userId: req.user._id.toString(), type: 'subscription' },
    });

    res.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Sub order error:', error);
    res.status(500).json({ success: false, message: 'Subscription initialization failed' });
  }
});

// @route POST /api/payment/verify-subscription
router.post('/verify-subscription', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Upgrade user
    const user = await User.findById(req.user._id);
    user.subscription.plan = 'premium';
    user.subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await user.save();

    // Notify user
    await Notification.create({
      type: 'payment_success',
      recipientId: req.user._id,
      message: `🎉 Success! You are now a Premium member. Enjoy unlimited listings and priority placement!`,
    });

    res.json({ success: true, message: 'Subscription activated!', user });
  } catch (error) {
    console.error('Verify subscription error:', error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

// @route POST /api/payment/create-wallet-order
router.post('/create-wallet-order', protect, async (req, res) => {
  try {
    const { amount } = req.body; // Amount in INR
    if (!amount || amount < 10) return res.status(400).json({ success: false, message: 'Minimum ₹10 required' });
    
    const amountInPaise = amount * 100;
    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `wallet_${Date.now()}`,
      notes: { userId: req.user._id.toString(), type: 'wallet_deposit' },
    });

    res.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Wallet order failed' });
  }
});

// @route POST /api/payment/verify-wallet-deposit
router.post('/verify-wallet-deposit', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Add to wallet
    const user = await User.findById(req.user._id);
    user.wallet.balance += Number(amount);
    user.wallet.transactions.push({
      type: 'deposit',
      amount: Number(amount),
      description: `Added ₹${amount} via Razorpay`,
    });
    await user.save();

    res.json({ success: true, message: `₹${amount} added to wallet!`, balance: user.wallet.balance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

module.exports = router;
