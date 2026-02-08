const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../backend/.env' });
(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false, collection: 'users' }));
    const user = await User.findOne({ email: 'insta-autodm-test@example.com' }).lean();
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }
    console.log('User:', JSON.stringify({ _id: user._id, email: user.email, instagramOAuthState: user.instagramOAuthState, instagramOAuthStateExpires: user.instagramOAuthStateExpires }, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('ERR', err.message || err);
    process.exit(1);
  }
})();
