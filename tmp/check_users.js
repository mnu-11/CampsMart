const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require(path.join(__dirname, '../backend/models/User'));
  const user = await User.findOne({ email: { $ne: 'test@example.com' } });
  if (user) console.log('User Found:', user.email, 'Verified:', user.isEmailVerified, 'Approved:', user.isApproved);
  else console.log('No other users');
  process.exit(0);
}

check();
