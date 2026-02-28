require('dotenv').config();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { config } = require('./src/config/env');

async function testAuth() {
  console.log('\n===========================================');
  console.log('COMPREHENSIVE JWT AUTHENTICATION TEST');
  console.log('===========================================\n');
  
  // Step 1: Check environment
  console.log('STEP 1: Environment Check');
  console.log('-------------------------');
  console.log(`process.env.JWT_SECRET: "${process.env.JWT_SECRET}"`);
  console.log(`process.env.JWT_SECRET length: ${process.env.JWT_SECRET?.length}`);
  console.log(`config.jwtSecret: "${config.jwtSecret}"`);
  console.log(`config.jwtSecret length: ${config.jwtSecret?.length}`);
  console.log(`Secrets match: ${process.env.JWT_SECRET === config.jwtSecret}\n`);
  
  // Step 2: Generate token (same way backend does it in auth routes)
  console.log('STEP 2: Generate Token (Using config.jwtSecret)');
  console.log('------------------------------------------------');
  const testUserId = '675894156aef25a2f0dca87c';
  const testEmail = 'test.facebook@example.com';
  
  const token = jwt.sign(
    { id: testUserId, email: testEmail },
    config.jwtSecret, // Using same secret as backend routes
    { expiresIn: '1h' }
  );
  
  console.log(`Token generated for user: ${testUserId}`);
  console.log(`Token (first 100 chars): ${token.substring(0, 100)}...`);
  console.log(`Token length: ${token.length}\n`);
  
  // Step 3: Decode token (non-verifying)
  console.log('STEP 3: Decode Token (Non-Verifying)');
  console.log('-------------------------------------');
  const decoded = jwt.decode(token);
  console.log('Decoded payload:', JSON.stringify(decoded, null, 2));
  console.log('');
  
  // Step 4: Verify token locally (same way middleware does)
  console.log('STEP 4: Local Token Verification');
  console.log('---------------------------------');
  try {
    const verifiedLocal = jwt.verify(token, config.jwtSecret || process.env.JWT_SECRET);
    console.log('✅ Local verification SUCCESSFUL');
    console.log('Verified user ID:', verifiedLocal.id);
    console.log('Verified email:', verifiedLocal.email);
  } catch (err) {
    console.log('❌ Local verification FAILED');
    console.log('Error:', err.message);
  }
  console.log('');
  
  // Step 5: Test API endpoint
  console.log('STEP 5: Test API Endpoint (http://localhost:5001/api/auth/facebook/pages)');
  console.log('-------------------------------------------------------------------------');
  try {
    const response = await axios.get('http://localhost:5001/api/auth/facebook/pages', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ API Request SUCCESSFUL (Status: ${response.status})`);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.log('❌ API Request FAILED');
    if (err.response) {
      console.log(`Status: ${err.response.status}`);
      console.log('Error data:', err.response.data);
    } else {
      console.log('Error:', err.message);
    }
  }
  
  console.log('\n===========================================');
  console.log('TEST COMPLETE');
  console.log('===========================================\n');
}

testAuth().catch(console.error);
