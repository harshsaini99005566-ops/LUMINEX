const fs = require('fs');
try {
  require('dotenv').config({ path: __dirname + '/../backend/.env' });
  const { generateAuthUrl } = require('../backend/src/services/instagramOAuth');
  const state = 'auto_state_' + Date.now();
  const url = generateAuthUrl(state);
  fs.writeFileSync(__dirname + '/oauth_url.txt', JSON.stringify({ url, state }, null, 2));
  console.log('Wrote oauth URL to tools/oauth_url.txt');
} catch (err) {
  fs.writeFileSync(__dirname + '/oauth_url.txt', JSON.stringify({ error: err.message, stack: err.stack }, null, 2));
  console.error('Failed to generate oauth url:', err.message);
  process.exit(1);
}
