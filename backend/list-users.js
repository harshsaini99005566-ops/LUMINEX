/**
 * List all users in the database
 * Usage: node backend/list-users.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function listUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const users = await User.find({}).select('-password');
    
    if (users.length === 0) {
      console.log('📭 No users found in the database\n');
      process.exit(0);
    }

    console.log(`📋 Found ${users.length} user(s):\n`);
    console.log('─'.repeat(80));
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Name: ${user.firstName || 'N/A'} ${user.lastName || ''}`);
      console.log(`   Plan: ${user.plan}`);
      console.log(`   Created: ${user.createdAt?.toLocaleDateString() || 'N/A'}`);
      console.log(`   Last Login: ${user.lastLogin?.toLocaleString() || 'Never'}`);
      console.log(`   Active: ${user.isActive ? '✅' : '❌'}`);
      console.log('─'.repeat(80));
    });
    
    console.log('\n💡 To reset a password, run:');
    console.log('   node backend/reset-password.js <email> <new-password>\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listUsers();
