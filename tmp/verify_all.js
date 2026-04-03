const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function verifyAll() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require(path.join(__dirname, '../backend/models/User'));
  const res = await User.updateMany({}, { $set: { isEmailVerified: true, isApproved: true } });
  console.log(`✅ ${res.modifiedCount} users verified and approved!`);
  process.exit(0);
}

verifyAll().catch(e => { console.error(e); process.exit(1); });
