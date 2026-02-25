const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;

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
      },
      function (accessToken, refreshToken, profile, done) {
        return done(null, profile);
      },
    ),
  );
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
