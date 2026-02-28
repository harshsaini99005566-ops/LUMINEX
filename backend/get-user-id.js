require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function getUserId() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/insta_automation');
    console.log('✅ Connected to MongoDB\n');
    
    const user = await User.findOne({ email: 'test.facebook@example.com' });
    
    if (user) {
      console.log('👤 User Found:');
      console.log(`   ID: ${user._id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Facebook Pages: ${user.facebookPages?.length || 0}`);
    } else {
      console.log('❌ User not found');
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

getUserId();
