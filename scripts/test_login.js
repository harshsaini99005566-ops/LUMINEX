const axios = require('axios');

(async () => {
  try {
    const res = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'test@example.com',
      password: 'Password123'
    }, {
      timeout: 5000
    });
    console.log('status', res.status);
    console.log('data', res.data);
  } catch (err) {
    if (err.response) {
      console.error('response error', err.response.status, err.response.data);
    } else {
      console.error('request error', err.message);
    }
    process.exit(1);
  }
})();
