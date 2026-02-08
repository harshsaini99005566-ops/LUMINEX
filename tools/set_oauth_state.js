const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../backend/.env' });
const UserSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
const User = mongoose.model('User', UserSchema);

(async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not set');
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    const email = 'insta-autodm-test@example.com';
    let user = await User.findOne({ email });
    if (!user) {
      console.log('Test user not found, creating...');
      user = await User.create({ email, password: 'password123', firstName: 'Auto', lastName: 'DM' });
      console.log('Created user:', user._id.toString());
    } else {
      console.log('Found user:', user._id.toString());
    }

    const state = 'auto_state_' + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await User.updateOne({ _id: user._id }, { instagramOAuthState: state, instagramOAuthStateExpires: expiresAt });

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    const scopes = [
      'instagram_business_basic',
      'instagram_business_content_publish',
      'instagram_business_manage_messages',
      'instagram_business_manage_comments',
      'pages_read_engagement',
    ].join(',');

    const authUrl = `https://www.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_APP_ID}&scope=${encodeURIComponent(scopes)}&response_type=code&redirect_uri=${encodeURIComponent(backendUrl + '/api/instagram/auth/callback')}&state=${state}`;

    const out = { userId: user._id.toString(), state, expiresAt: expiresAt.toISOString(), authUrl };
    require('fs').writeFileSync(__dirname + '/oauth_state.json', JSON.stringify(out, null, 2));
    console.log('Wrote oauth state and URL to tools/oauth_state.json');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
