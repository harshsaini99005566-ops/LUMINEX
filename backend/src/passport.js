const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;

// Check if Facebook credentials are available
if (!process.env.FB_APP_ID || !process.env.FB_APP_SECRET) {
  console.warn(
    "Facebook OAuth credentials not found. Facebook login will not be available.",
  );
} else {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FB_APP_ID,
        clientSecret: process.env.FB_APP_SECRET,
        callbackURL:
          "https://momentarily-unpurchased-jarred.ngrok-free.dev/api/auth/facebook/callback",
        profileFields: ["id", "displayName", "emails"],
      },
      function (accessToken, refreshToken, profile, done) {
        return done(null, profile);
      },
    ),
  );
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
