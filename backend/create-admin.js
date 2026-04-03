/**
 * Run this script ONCE to create your admin account:
 *   node create-admin.js
 *
 * Set ADMIN_EMAIL and ADMIN_PASSWORD below or as env vars.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@campusmarket.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@1234!';

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      existing.isApproved = true;
      existing.isEmailVerified = true;
      await existing.save();
      console.log('✅ Existing user promoted to admin:', ADMIN_EMAIL);
    } else {
      console.log('ℹ️  Admin already exists:', ADMIN_EMAIL);
    }
    await mongoose.disconnect();
    return;
  }

  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    collegeId: 'ADMIN-001',
    role: 'admin',
    isEmailVerified: true,
    isApproved: true,
    university: 'Administration',
  });

  console.log('🎉 Admin created!');
  console.log('   Email:', ADMIN_EMAIL);
  console.log('   Password:', ADMIN_PASSWORD);
  console.log('   → Change the password after first login!');
  await mongoose.disconnect();
}

createAdmin().catch(e => { console.error(e); process.exit(1); });
