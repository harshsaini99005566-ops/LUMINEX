const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("./models/User");

// Check if Facebook credentials are available
const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID || process.env.FACEBOOK_APP_ID;
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET || process.env.FACEBOOK_APP_SECRET;

// Validate credentials are not placeholders
const hasValidCredentials = FACEBOOK_CLIENT_ID && 
                           FACEBOOK_CLIENT_SECRET && 
                           !FACEBOOK_CLIENT_ID.includes('YOUR') && 
                           !FACEBOOK_CLIENT_ID.includes('HERE') &&
                           !FACEBOOK_CLIENT_SECRET.includes('YOUR') &&
                           !FACEBOOK_CLIENT_SECRET.includes('HERE') &&
                           FACEBOOK_CLIENT_ID.length > 10;

if (!hasValidCredentials) {
  console.warn(
    "⚠️  Facebook OAuth credentials not configured properly.",
  );
  console.warn(
    "    Add real FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET to .env to enable Facebook login.",
  );
  console.warn(
    "    See FACEBOOK_OAUTH_SETUP_GUIDE.md for instructions.",
  );
} else {
  console.log("✅ Facebook OAuth configured successfully");
  passport.use(
    new FacebookStrategy(
      {
        clientID: FACEBOOK_CLIENT_ID,
        clientSecret: FACEBOOK_CLIENT_SECRET,
        callbackURL: process.env.FACEBOOK_REDIRECT_URI || process.env.FACEBOOK_CALLBACK_URL || "https://luminex-bwjm.onrender.com/api/auth/facebook/callback",
        profileFields: ["id", "emails", "name"],
        enableProof: true // Adds extra security
      },
      async function (accessToken, refreshToken, profile, done) {
        try {
          // Extract email from profile
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          
          if (!email) {
            return done(new Error('No email found in Facebook profile'), null);
          }

          // Find or create user in database
          let user = await User.findOne({ email: email });
          
          if (!user) {
            // Create new user if doesn't exist
            user = new User({
              email: email,
              firstName: profile.name.givenName || 'Facebook',
              lastName: profile.name.familyName || 'User',
              facebookId: profile.id,
              plan: 'free',
              // Don't require password for OAuth users
              authProvider: 'facebook'
            });
            await user.save();
            console.log(`✅ New user created via Facebook: ${email}`);
          } else {
            // Update existing user with Facebook ID if not set
            if (!user.facebookId) {
              user.facebookId = profile.id;
              await user.save();
            }
            console.log(`✅ Existing user logged in via Facebook: ${email}`);
          }

          return done(null, user);
        } catch (error) {
          console.error('Facebook authentication error:', error);
          return done(error, null);
        }
      },
    ),
  );
}

// Serialize user: Store only user ID in session (not entire user object)
// This is CRITICAL for preventing session bloat and security issues
passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

// Deserialize user: Fetch user from database using stored ID
// This ensures we always have fresh user data from database
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password'); // Exclude password
    if (!user) {
      return done(new Error('User not found'), null);
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
