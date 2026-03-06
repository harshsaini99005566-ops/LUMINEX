const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const compression = require("compression");
const session = require("express-session");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, '../../.env') });
console.log("IG APP ID:", process.env.INSTAGRAM_APP_ID);
console.log("FB Client ID:", process.env.FACEBOOK_CLIENT_ID);

const { connectDB, getDBStatus } = require("../config/database");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { authLimiter, apiLimiter } = require("./middleware/rateLimiter");
const {
  securityHeaders,
  corsConfig,
  validateRequest,
  requestLogger,
  sanitizeInput,
} = require("./middleware/security");
const logger = require("../utils/logger");
const { validateEnv, config } = require("../config/env");
require("./passport");

try {
  validateEnv();
} catch (error) {
  logger.error("Environment validation failed", error);
  process.exit(1);
}

// Main application startup function
const startServer = async () => {
  logger.info("🚀 Starting Express server...", {
    environment: config.nodeEnv,
    port: config.port,
  });

  // Step 1: Connect to MongoDB BEFORE creating Express server
  logger.info("📡 Initializing MongoDB connection...");
  await connectDB();

  // Step 2: Create Express app
  const app = express();

  // Trust proxy - CRITICAL for Render/HTTPS deployment
  // Without this, sessions won't work behind a proxy
  app.set('trust proxy', 1);

  // Step 3: Security and compression middleware (before routes)
  // Apply security headers using helmet
  securityHeaders(app);

  // Apply CORS
  app.use(cors(corsConfig));

  // Compression middleware
  if (config.performance.enableCompression) {
    app.use(compression());
  }

  // Request timeout
  app.use((req, res, next) => {
    req.setTimeout(120000); // 2 minutes
    next();
  });

  // Step 4: Request parsing middleware
  // Capture raw body for webhook signature verification using express.json verify option
  // This avoids consuming the request stream before body parsing and prevents 'stream is not readable' errors
  app.use(
    express.json({
      limit: config.security.bodyLimit,
      verify: (req, res, buf) => {
        if (req.path && req.path.includes("/webhooks")) {
          req.rawBody = buf.toString("utf8");
        }
      },
    }),
  );
  app.use(
    express.urlencoded({ extended: true, limit: config.security.bodyLimit }),
  );

  // Step 5: Security and validation middleware
  app.use(validateRequest);
  app.use(sanitizeInput);
  app.use(requestLogger);

  // Serve uploaded files
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  // Step 5.5: Session and Passport Configuration
  // CRITICAL: This must come AFTER body parsing and BEFORE routes
  const passport = require('passport');
  const { MongoStore } = require('connect-mongo');
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 7 * 24 * 60 * 60, // 7 days
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true in production (HTTPS only)
      httpOnly: true, // Prevents XSS attacks
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site OAuth in production
      domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
    },
    proxy: true // Trust the reverse proxy
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  logger.info('✅ Session and Passport middleware initialized');

  // Step 6: Setup routes

  const renderPage = (title, bodyHtml) => `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111; margin: 40px; line-height: 1.6; }
          h1 { margin-bottom: 12px; }
          p { margin: 8px 0; }
        </style>
      </head>
      <body>
        ${bodyHtml}
      </body>
    </html>
  `;

  // Health check endpoint - includes DB status
  app.get("/health", (req, res) => {
    const dbStatus = getDBStatus();
    res.status(200).json({
      success: true,
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      database: dbStatus,
      server: "running",
    });
  });

  // Root endpoint - Homepage (Meta verification checks this)
  app.get("/", (req, res) => {
    res.status(200).send("LUMINEX is running");
  });

  // Privacy Policy endpoint
  app.get("/privacy", (req, res) => {
    res.send(
      renderPage(
        "LUMINEX Privacy Policy",
        `
          <h1>LUMINEX Privacy Policy</h1>
          <p>We only use data for Meta integrations.</p>
          <p>We do not sell, share, or misuse user data.</p>
          <p>All data is used strictly for automation services requested by the user.</p>
        `,
      ),
    );
  });

  // Terms of Service endpoint
  app.get("/terms", (req, res) => {
    res.send(
      renderPage(
        "LUMINEX Terms of Service",
        `
          <h1>LUMINEX Terms of Service</h1>
          <p>By using LUMINEX, you agree to use the service lawfully and only for authorized automation.</p>
          <p>You are responsible for the content you connect and any actions taken through your account.</p>
          <p>Service availability and features may change over time.</p>
        `,
      ),
    );
  });

  // Facebook OAuth routes (direct routes, no /api prefix) - only if credentials are available
  if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
    app.get(
      "/auth/facebook",
      passport.authenticate("facebook", { scope: ["email"] }),
    );

    app.get(
      "/auth/facebook/callback",
      passport.authenticate("facebook", {
        failureRedirect: process.env.FRONTEND_URL + "/login?error=facebook_auth_failed",
      }),
      (req, res) => {
        // Successful authentication
        // Generate JWT token for the authenticated user
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
          { id: req.user._id, email: req.user.email },
          config.jwtSecret,
          { expiresIn: config.jwtExpiry }
        );

        // Set the token as a cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: config.nodeEnv === 'production',
          sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Redirect to frontend dashboard
        res.redirect(process.env.FRONTEND_URL + "/dashboard");
      },
    );
  } else {
    app.get("/auth/facebook", (req, res) => {
      res.status(503).json({ error: "Facebook OAuth not configured" });
    });

    app.get("/auth/facebook/callback", (req, res) => {
      res.status(503).json({ error: "Facebook OAuth not configured" });
    });
  }

  // Test route to check if user session is working
  app.get("/check", (req, res) => {
    if (req.user) {
      res.json({
        authenticated: true,
        user: {
          id: req.user._id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          plan: req.user.plan
        },
        message: "✅ Session working - User authenticated"
      });
    } else {
      res.json({
        authenticated: false,
        user: null,
        message: "❌ Session not saved - User not authenticated"
      });
    }
  });

  // API Routes with /api prefix (apply rate limiting)
  try {
    // Conditional rate limiter for auth routes (skip OAuth callbacks)
    const conditionalAuthLimiter = (req, res, next) => {
      // Skip rate limiting for OAuth callback endpoints
      const oauthPaths = ['/facebook', '/facebook/callback', '/instagram', '/instagram/callback'];
      const isOAuthPath = oauthPaths.some(path => req.path.startsWith(path));
      
      if (isOAuthPath) {
        // Skip rate limiting for OAuth flows
        return next();
      }
      
      // Apply rate limiting for other auth endpoints
      return authLimiter(req, res, next);
    };

    // Auth routes (stricter rate limiting, except OAuth)
    app.use("/api/auth", conditionalAuthLimiter, require("./routes/auth"));

    // Main API routes (moderate rate limiting)
    app.use("/api/instagram", apiLimiter, require("./routes/instagram"));
    app.use("/api/instagram", apiLimiter, require("./routes/instagramOAuth"));
    app.use("/api/messages", apiLimiter, require("./routes/messages"));
    app.use("/api/webhooks", require("./routes/webhookSubscription"));
    app.use("/api/rules", apiLimiter, require("./routes/rules"));
    app.use(
      "/api/conversations",
      apiLimiter,
      require("./routes/conversations"),
    );
    app.use("/api/billing", apiLimiter, require("./routes/billing"));
    app.use("/api/analytics", apiLimiter, require("./routes/analytics"));
    app.use("/api/posts", apiLimiter, require("./routes/posts"));

    // Webhook routes (no rate limiting for Stripe/Instagram webhooks)
    app.use("/webhooks", require("./routes/webhooks"));

    app.use("/api/onboarding", apiLimiter, require("./routes/onboarding"));

    logger.info("✅ All routes loaded successfully");
  } catch (routeError) {
    logger.error("Error loading routes", {
      error: routeError.message,
      stack: routeError.stack,
    });
    throw routeError;
  }

  // Start scheduled jobs
  try {
    require("./jobs/resetMonthlyUsage");
    require("./jobs/refreshInstagramTokens");
    const { startScheduler } = require("./jobs/postScheduler");
    startScheduler();
    logger.info("✅ Scheduled jobs started (usage reset, token refresh, post scheduler)");
  } catch (jobError) {
    logger.warn("Scheduled jobs not available", { error: jobError.message });
  }

  // Step 7: Error handling middleware (must be last)

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

// Global error handlers
process.on("unhandledRejection", (reason, _promise) => {
  logger.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

// Start the server
startServer()
  .then(() => {
    logger.info("✅ Server initialized successfully");
  })
  .catch((error) => {
    logger.error("Failed to start server:", error.message);
    process.exit(1);
  });

module.exports = startServer;
