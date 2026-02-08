const axios = require('axios');
const logger = require('../utils/logger');

const testAPI = async () => {
  const baseURL = 'http://localhost:5001';
  const client = axios.create({ baseURL });

  const tests = [];

  try {
    // Test 1: Health check
    logger.info('🧪 Testing /health endpoint...');
    const healthRes = await client.get('/health');
    tests.push({
      name: 'Health Check',
      endpoint: '/health',
      status: healthRes.status === 200 ? '✅ PASS' : '❌ FAIL',
    });

    // Test 2: Root endpoint
    logger.info('🧪 Testing root endpoint...');
    const rootRes = await client.get('/');
    tests.push({
      name: 'Root Endpoint',
      endpoint: '/',
      status: rootRes.status === 200 ? '✅ PASS' : '❌ FAIL',
    });

    // Test 3: Signup endpoint availability
    logger.info('🧪 Testing signup endpoint (validation)...');
    try {
      await client.post('/api/auth/signup', {
        email: 'test@example.com',
        password: 'short',
        firstName: 'Test',
        lastName: 'User',
      });
    } catch (err) {
      if (err.response && err.response.status === 400) {
        tests.push({
          name: 'Signup Endpoint',
          endpoint: '/api/auth/signup',
          status: '✅ PASS',
        });
      } else {
        throw err;
      }
    }

    // Test 4: Login endpoint structure
    logger.info('🧪 Testing login endpoint (validation)...');
    try {
      await client.post('/api/auth/login', {
        email: 'nonexistent@example.com',
        password: 'password123',
      });
    } catch (err) {
      if (err.response && err.response.status === 401) {
        tests.push({
          name: 'Login Endpoint',
          endpoint: '/api/auth/login',
          status: '✅ PASS',
        });
      } else {
        throw err;
      }
    }

    // Summary
    logger.info('\n=============================');
    logger.info('✅ API VALIDATION COMPLETE');
    logger.info('=============================');
    tests.forEach((test) => {
      logger.info(`${test.status} - ${test.name}`);
    });
    logger.info('=============================\n');

  } catch (error) {
    logger.error('❌ API Test Failed:', error.message);
    process.exit(1);
  }
};

// Run tests
testAPI();
