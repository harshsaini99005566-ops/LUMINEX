#!/bin/bash
# Instagram Connection Diagnostic

echo "================================"
echo "INSTAGRAM CONNECTION DIAGNOSTIC"
echo "================================"
echo ""

echo "1. Checking Backend Configuration..."
echo "   .env file Instagram settings:"
grep -E "INSTAGRAM_|BACKEND_URL" e:\INSTA\ AUTOMATION\backend\.env 2>/dev/null || echo "   ❌ Cannot read .env"

echo ""
echo "2. Checking Database for Connected Accounts..."
node -e "
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });

const schema = new mongoose.Schema({
  userId: String,
  username: String,
  instagramId: String,
  isActive: Boolean
}, { collection: 'instagramaccounts' });

const InstagramAccount = mongoose.model('InstagramAccount', schema);

mongoose.connect(process.env.MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
}).then(async () => {
  const accounts = await InstagramAccount.find({});
  console.log('   Total Instagram Accounts: ' + accounts.length);
  accounts.forEach(acc => {
    console.log('   - ' + (acc.username || 'Unknown') + ' (Active: ' + acc.isActive + ')');
  });
  mongoose.connection.close();
}).catch(err => {
  console.log('   ❌ Database error: ' + err.message);
});
"

echo ""
echo "3. Testing OAuth Service..."
if curl -s http://localhost:5001/api/instagram/auth/url -H "Authorization: Bearer test" 2>/dev/null | grep -q "url"; then
  echo "   ✅ OAuth endpoint responding"
else
  echo "   ❌ OAuth endpoint not responding or missing credentials"
fi

echo ""
echo "4. Issues Identified:"
echo "   ❌ Instagram App ID not configured (showing: your_instagram_app_id)"
echo "   ❌ Instagram App Secret not configured (showing: your_instagram_app_secret)"
echo "   ❌ BACKEND_URL not set in .env"
echo "   ❌ Redirect URI mismatch"
echo ""

echo "5. Next Steps:"
echo "   a) Get Instagram App ID and Secret from Meta Developer Portal"
echo "   b) Update INSTAGRAM_APP_ID in .env"
echo "   c) Update INSTAGRAM_APP_SECRET in .env"
echo "   d) Set BACKEND_URL=http://localhost:5001 in .env"
echo "   e) Restart backend server"
echo ""
