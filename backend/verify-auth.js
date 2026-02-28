require('dotenv').config();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { config } = require('./src/config/env');

(async () => {
  try {
    // Test token generation
    const token = jwt.sign(
      { id: '69a2fb0e4a8fa28119eda7df', email: 'test.facebook@example.com' },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
    console.log('   ✅ Token generated successfully');
    
    // Test local verification
    const verified = jwt.verify(token, config.jwtSecret);
    console.log('   ✅ Token verified locally');
    console.log('      - User ID: ' + verified.id);
    console.log('      - Email: ' + verified.email);
    
    // Test API call
    const response = await axios.get('http://localhost:5001/api/auth/facebook/pages', {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   ✅ API authentication passed (Status: ' + response.status + ')');
    console.log('      - Pages returned: ' + response.data.pages.length);
    console.log('      - Success: ' + response.data.success);
    
    process.exit(0);
  } catch (err) {
    console.log('   ❌ Error: ' + err.message);
    process.exit(1);
  }
})();
