const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');

const approveAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await User.updateMany(
            {}, 
            { $set: { isEmailVerified: true, isApproved: true } }
        );
        console.log(`✅ Success! Updated ${result.modifiedCount} accounts.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
};

approveAll();
