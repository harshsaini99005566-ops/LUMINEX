/**
 * Password Reset Utility
 * Usage: node backend/reset-password.js <email> <new-password>
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('\n❌ Usage: node backend/reset-password.js <email> <new-password>\n');
    console.error('Example: node backend/reset-password.js user@example.com MyNewPass123!\n');
    process.exit(1);
  }

  if (newPassword.length < 8) {
    console.error('❌ Password must be at least 8 characters long\n');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.error(`❌ User not found: ${email}\n`);
      process.exit(1);
    }

    // Update password (will be auto-hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    console.log(`\n✅ Password reset successful for: ${email}`);
    console.log(`   New password: ${newPassword}`);
    console.log(`   You can now login with this password\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
