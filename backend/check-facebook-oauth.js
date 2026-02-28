/**
 * Check Facebook OAuth Status and Pages
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

(async () => {
  try {
    console.log('\n🔍 Checking Facebook OAuth Status...\n');
    console.log('==============================================');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/insta_automation';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    // Check environment variables
    console.log('📋 Environment Variables:');
    console.log('  FACEBOOK_CLIENT_ID:', process.env.FACEBOOK_CLIENT_ID ? '✅ SET' : '❌ MISSING');
    console.log('  FACEBOOK_CLIENT_SECRET:', process.env.FACEBOOK_CLIENT_SECRET ? '✅ SET' : '❌ MISSING');
    console.log('  FACEBOOK_REDIRECT_URI:', process.env.FACEBOOK_REDIRECT_URI || '❌ MISSING');
    console.log('  FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost:3000');
    console.log('');
    
    // Find all Facebook users
    const users = await User.find({ 
      facebookId: { $exists: true } 
    }).select('+facebookAccessToken');
    
    console.log(`📊 Facebook Users Found: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('❌ No Facebook users found in database');
      console.log('\n🚀 Next Steps:');
      console.log('   1. Make sure servers are running');
      console.log('   2. Open: http://localhost:3000/login');
      console.log('   3. Click "Continue with Facebook"');
      console.log('   4. Grant permissions and complete OAuth');
      console.log('   5. Run this script again to verify\n');
      process.exit(0);
    }
    
    // Display each user's details
    users.forEach((user, index) => {
      console.log(`\n👤 User #${index + 1}`);
      console.log('─────────────────────────────────────────────');
      console.log(`Email:              ${user.email}`);
      console.log(`Name:               ${user.firstName} ${user.lastName}`);
      console.log(`Facebook ID:        ${user.facebookId}`);
      console.log(`Has Access Token:   ${user.facebookAccessToken ? '✅ YES' : '❌ NO'}`);
      
      if (user.facebookAccessToken) {
        console.log(`Access Token:       ${user.facebookAccessToken.substring(0, 40)}...`);
      }
      
      const pages = user.facebookPages || [];
      console.log(`\n📄 Facebook Pages:  ${pages.length}`);
      
      if (pages.length === 0) {
        console.log('   ⚠️  NO PAGES STORED IN DATABASE');
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
    
    // Summary
    const totalPages = users.reduce((sum, u) => sum + (u.facebookPages?.length || 0), 0);
    const usersWithTokens = users.filter(u => u.facebookAccessToken).length;
    const usersWithPages = users.filter(u => u.facebookPages?.length > 0).length;
    
    console.log('\n📊 Summary:');
    console.log(`   Total Facebook users:     ${users.length}`);
    console.log(`   Users with access token:  ${usersWithTokens}`);
    console.log(`   Users with pages:         ${usersWithPages}`);
    console.log(`   Total pages across users: ${totalPages}`);
    
    if (totalPages === 0) {
      console.log('\n⚠️  ACTION REQUIRED:');
      console.log('   No pages found in database.');
      console.log('\n   🔧 To fix this:');
      console.log('   1. Ensure Facebook App is configured correctly');
      console.log('   2. Logout and login again with Facebook');
      console.log('   3. Watch backend terminal for "FETCHING FACEBOOK PAGES"');
      console.log('   4. Verify pages are saved with "Saved pages to database successfully"');
    } else {
      console.log('\n✅ SUCCESS! Pages are stored and ready.');
      console.log('   Dashboard should display these pages.');
      console.log('   Test at: http://localhost:3000/dashboard');
    }
    
    console.log('');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
