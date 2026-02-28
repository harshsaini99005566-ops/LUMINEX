require('dotenv').config();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { config } = require('./src/config/env');

async function testFacebookPagesAPI() {
  console.log('\n========================================');
  console.log('TESTING FACEBOOK PAGES API');
  console.log('========================================\n');
  
  const userId = '69a2fb0e4a8fa28119eda7df';  // Real user ID from database
  const userEmail = 'test.facebook@example.com';
  
  // Generate token
  const token = jwt.sign(
    { id: userId, email: userEmail },
    config.jwtSecret,
    { expiresIn: '1h' }
  );
  
  console.log(`User ID: ${userId}`);
  console.log(`Email: ${userEmail}`);
  console.log(`Token (first 50): ${token.substring(0, 50)}...\n`);
  
  try {
    const response = await axios.get('http://localhost:5001/api/auth/facebook/pages', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ API REQUEST SUCCESSFUL (Status: ${response.status})\n`);
    console.log('Response Data:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n✅ FACEBOOK PAGES API IS WORKING!\n');
  } catch (err) {
    console.log('❌ API REQUEST FAILED\n');
    if (err.response) {
      console.log(`Status Code: ${err.response.status}`);
      console.log('Error Response:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.log('Error:', err.message);
    }
  }
  
  console.log('========================================\n');
}

testFacebookPagesAPI();
