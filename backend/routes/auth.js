const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const OTP = require('../models/OTP');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Email transporter
const getTransporter = () => nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp) => {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"CampsMart" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your CampsMart Verification Code: ${otp}`,
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:32px;background:#fff;border:1px solid #e5e7eb;border-radius:16px;">
        <h2 style="color:#2563eb;margin-top:0;">CampsMart</h2>
        <p style="color:#374151;font-size:16px;">Use the code below to verify your email address.</p>
        <div style="background:#f3f4f6;padding:16px;text-align:center;border-radius:12px;margin:24px 0;">
          <span style="font-size:32px;font-weight:900;letter-spacing:8px;color:#111827;">${otp}</span>
        </div>
        <p style="color:#6b7280;font-size:13px;margin-bottom:0;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};

const notifyAdmin = async (type, message, itemId = null, senderId = null, metadata = {}) => {
  try {
    const admins = await User.find({ role: 'admin' });
    const promises = admins.map(admin =>
      Notification.create({ type, recipientId: admin._id, senderId, itemId, message, metadata })
    );
    await Promise.all(promises);

    // Also send email to admin
    if (process.env.ADMIN_EMAIL) {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: `"Campus Marketplace" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `[Admin Alert] ${message}`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;background:#f9fafb;border-radius:12px;">
            <h2 style="color:#2563eb;">Campus Marketplace — Admin Alert</h2>
            <p>${message}</p>
            ${Object.keys(metadata).length ? `<pre style="background:#e5e7eb;padding:12px;border-radius:8px;">${JSON.stringify(metadata, null, 2)}</pre>` : ''}
            <a href="${process.env.CLIENT_URL}/admin" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;margin-top:12px;">Open Admin Panel</a>
          </div>
        `,
      }).catch(e => console.warn('Admin email warn:', e.message));
    }
  } catch (e) {
    console.error('notifyAdmin error:', e.message);
  }
};

// @route   POST /api/auth/send-otp
router.post('/send-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
], async (req, res) => {
  const { email } = req.body;
  
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ email }); // Clear older OTPs
    await OTP.create({ email, code });

    await sendOTPEmail(email, code);
    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Check your SMTP settings.' });
  }
});

// @route   POST /api/auth/register
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('otp').notEmpty().withMessage('OTP is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { name, email, password, university, phone, location, otp } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered' });

    // Verify OTP
    const validOtp = await OTP.findOne({ email, code: otp });
    if (!validOtp) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    const user = await User.create({
      name, email, password, university, phone, location,
      isEmailVerified: true, 
      isApproved: true,     
    });

    await OTP.deleteMany({ email });

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now log in.',
      user
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed: ' + error.message });
  }
});

// @route   GET /api/auth/verify-email
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification link' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Notify admin to review college ID
    await notifyAdmin(
      'new_item',
      `User ${user.name} verified their email. Please review their College ID (${user.collegeId}) and approve their account.`,
      null,
      user._id,
      { userId: user._id, name: user.name, email: user.email, collegeId: user.collegeId }
    );

    res.json({ success: true, message: 'Email verified successfully! Waiting for admin approval.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email first', code: 'EMAIL_NOT_VERIFIED' });
    }

    if (!user.isApproved && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Your account is pending admin approval. You\'ll receive an email once approved.', code: 'PENDING_APPROVAL' });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, university, phone, location, bio, upiId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, university, phone, location, bio, upiId },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+emailVerificationToken +emailVerificationExpires');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ success: false, message: 'Email already verified' });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user, verificationToken);
    res.json({ success: true, message: 'Verification email resent' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PATCH /api/auth/upgrade
router.patch('/upgrade', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.subscription.plan = 'premium';
    user.subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await user.save();

    res.json({ success: true, message: 'Upgraded to Premium!', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
module.exports.notifyAdmin = notifyAdmin;
