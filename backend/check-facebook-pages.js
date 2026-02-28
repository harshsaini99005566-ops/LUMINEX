/**
 * Check Facebook Pages in Database
 * 
 * Run this to verify if pages are stored correctly in MongoDB
 * 
 * Usage: node check-facebook-pages.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

(async () => {
  try {
    console.log('\n🔍 Checking Facebook Pages in Database...\n');
    console.log('==============================================');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/insta_automation';
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    // Find all users with Facebook authentication
    const facebookUsers = await User.find({ 
      facebookId: { $exists: true } 
    }).select('email firstName lastName facebookId facebookPages createdAt updatedAt');
    
    console.log(`📊 Total Facebook users found: ${facebookUsers.length}\n`);
    
    if (facebookUsers.length === 0) {
      console.log('❌ No Facebook users found.');
      console.log('   You need to login with Facebook first.');
      console.log('   Go to: http://localhost:3000/login');
      console.log('   Click "Continue with Facebook"\n');
      process.exit(0);
    }
    
    // Display each user's pages
    facebookUsers.forEach((user, index) => {
      console.log(`\n👤 User #${index + 1}`);
      console.log('─────────────────────────────────────────────');
      console.log(`Name:        ${user.firstName} ${user.lastName}`);
      console.log(`Email:       ${user.email}`);
      console.log(`Facebook ID: ${user.facebookId}`);
      console.log(`User ID:     ${user._id}`);
      console.log(`Created:     ${user.createdAt}`);
      console.log(`Updated:     ${user.updatedAt}`);
      
      const pages = user.facebookPages || [];
      console.log(`\n📄 Facebook Pages: ${pages.length}`);
      
      if (pages.length === 0) {
        console.log('   ⚠️  NO PAGES SAVED');
        console.log('   → User needs to re-authenticate with Facebook');
        console.log('   → Pages are fetched during OAuth callback');
      } else {
        pages.forEach((page, idx) => {
          console.log(`\n   Page ${idx + 1}:`);
          console.log(`   ├─ Name: ${page.pageName}`);
          console.log(`   ├─ ID:   ${page.pageId}`);
          console.log(`   └─ Instagram: ${page.hasInstagram ? '✅ YES' : '❌ NO'}`);
        });
      }
    });
    
    console.log('\n==============================================');
    console.log('\n✅ Database check complete\n');
    
    // Summary
    const totalPages = facebookUsers.reduce((sum, user) => sum + (user.facebookPages?.length || 0), 0);
    console.log('📊 Summary:');
    console.log(`   - Total users: ${facebookUsers.length}`);
    console.log(`   - Total pages: ${totalPages}`);
    console.log(`   - Avg pages per user: ${(totalPages / facebookUsers.length).toFixed(1)}`);
    
    if (totalPages === 0) {
      console.log('\n🚨 ACTION REQUIRED:');
      console.log('   No pages found in database.');
      console.log('   Follow these steps:');
      console.log('   1. Open: http://localhost:3000/login');
      console.log('   2. Click "Continue with Facebook"');
      console.log('   3. Complete Facebook authentication');
      console.log('   4. Run this script again to verify');
    } else {
      console.log('\n✅ Pages found! Users can see them on dashboard.');
      console.log('   Test URL: http://localhost:3000/dashboard');
    }
    
    console.log('');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
