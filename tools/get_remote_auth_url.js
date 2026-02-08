const axios = require('axios');
require('dotenv').config({ path: __dirname + '/../backend/.env' });
(async () => {
  try {
    const email = 'insta-autodm-test@example.com';
    const password = 'password123';

    // Try localhost first
    const baseLocal = process.env.BACKEND_URL_LOCAL || 'http://localhost:5001';
    const baseTunnel = process.env.API_URL || 'https://angel-retired-mud-investment.trycloudflare.com';

    const tryLogin = async (base) => {
      try {
        const res = await axios.post(`${base}/api/auth/login`, { email, password }, { timeout: 5000 });
        return { base, token: res.data.token };
      } catch (err) {
        return { base, error: err.message };
      }
    };

    console.log('Trying local login...');
    let r = await tryLogin('http://localhost:5001');
    if (!r.token) {
      console.log('Local login failed:', r.error);
      console.log('Trying tunnel login...');
      r = await tryLogin(baseTunnel);
      if (!r.token) {
        console.error('Tunnel login failed too:', r.error);
        process.exit(1);
      }
    }

    const token = r.token;
    console.log('Got token from', r.base);

    const resp = await axios.get(`${r.base}/api/instagram/auth/url`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    });

    console.log('Auth URL response:', JSON.stringify(resp.data, null, 2));
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
