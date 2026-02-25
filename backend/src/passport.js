const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;

// Check if Facebook credentials are available
const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID || process.env.FACEBOOK_APP_ID;
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET || process.env.FACEBOOK_APP_SECRET;

if (!FACEBOOK_CLIENT_ID || !FACEBOOK_CLIENT_SECRET) {
  console.warn(
    "⚠️  Facebook OAuth credentials not found. Facebook login will not be available.",
  );
  console.warn(
    "    Add FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET to .env to enable Facebook login.",
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
