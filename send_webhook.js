const fs = require('fs');
const http = require('http');
const payload = fs.readFileSync('payload.json');
const signature = 'sha256=cfcb5f4e388da68a8358c43a23b15cba2a8b6734e28e1a85bf0f6bfb57bcc4ad';

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/webhooks/instagram',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'X-Hub-Signature-256': signature,
  },
};

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  res.setEncoding('utf8');
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log('Response:', data); });
});

req.on('error', (err) => { console.error('Request error:', err); });
req.write(payload);
req.end();
