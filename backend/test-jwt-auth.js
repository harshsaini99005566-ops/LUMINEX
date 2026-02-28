require('dotenv').config();
const jwt = require('jsonwebtoken');
const { config } = require('./src/config/env');

console.log('\n🔍 JWT Configuration Debug\n');
console.log('=' .repeat(60));

// Check environment variable
console.log('\n1️⃣ Environment Variable:');
console.log(`   process.env.JWT_SECRET = "${process.env.JWT_SECRET}"`);

// Check config object
console.log('\n2️⃣ Config Object:');
console.log(`   config.jwtSecret = "${config.jwtSecret}"`);
console.log(`   config.jwtExpiry = "${config.jwtExpiry}"`);

// Check if they match
console.log('\n3️⃣ Comparison:');
if (process.env.JWT_SECRET === config.jwtSecret) {
  console.log('   ✅ MATCH: Environment and config use same secret');
} else {
  console.log('   ❌ MISMATCH: Different secrets!');
  console.log(`      Env length: ${process.env.JWT_SECRET?.length || 0}`);
  console.log(`      Config length: ${config.jwtSecret?.length || 0}`);
}

// Test token generation and verification
console.log('\n4️⃣ Token Generation Test:');
const testPayload = {
  id: 'test-user-id-123',
  email: 'test@example.com'
};

try {
  // Generate token using config.jwtSecret (same as backend routes)
  const token = jwt.sign(testPayload, config.jwtSecret, { expiresIn: '1h' });
  console.log(`   ✅ Token generated successfully`);
  console.log(`   Token: ${token.substring(0, 50)}...`);
  
  console.log('\n5️⃣ Token Verification Test (using config.jwtSecret):');
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    console.log('   ✅ Verification SUCCESSFUL');
    console.log(`   Decoded ID: ${decoded.id}`);
    console.log(`   Decoded Email: ${decoded.email}`);
  } catch (verifyErr) {
    console.log('   ❌ Verification FAILED');
    console.log(`   Error: ${verifyErr.message}`);
  }
  
  console.log('\n6️⃣ Token Verification Test (using env variable):');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('   ✅ Verification SUCCESSFUL');
    console.log(`   Decoded ID: ${decoded.id}`);
    console.log(`   Decoded Email: ${decoded.email}`);
  } catch (verifyErr) {
    console.log('   ❌ Verification FAILED');
    console.log(`   Error: ${verifyErr.message}`);
  }
  
  // Test the actual auth middleware logic
  console.log('\n7️⃣ Auth Middleware Logic Test:');
  const middlewareSecret = config.jwtSecret || process.env.JWT_SECRET;
  console.log(`   Middleware uses: "${middlewareSecret}"`);
  try {
    const decoded = jwt.verify(token, middlewareSecret);
    console.log('   ✅ Middleware verification SUCCESSFUL');
  } catch (verifyErr) {
    console.log('   ❌ Middleware verification FAILED');
    console.log(`   Error: ${verifyErr.message}`);
  }
  
} catch (err) {
  console.log(`   ❌ Token generation failed: ${err.message}`);
}

console.log('\n' + '='.repeat(60));
console.log('\n✅ Diagnostic Complete\n');
