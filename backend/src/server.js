const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const compression = require("compression");
const session = require("express-session");
const dotenv = require("dotenv");
dotenv.config();
console.log("IG APP ID:", process.env.INSTAGRAM_APP_ID);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection failed", err.message);
  });
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

  // Step 6: Setup routes

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

  // Root endpoint - Homepage
  app.get("/", (req, res) => {
    res.send("<h1>VEXORA Home</h1><p>Instagram Automation Platform</p>");
  });

  // Privacy Policy endpoint
  app.get("/privacy", (req, res) => {
    res.send("<h2>Privacy Policy</h2><p>Your privacy details here.</p>");
  });

  // Terms of Service endpoint
  app.get("/terms", (req, res) => {
    res.send("<h2>Terms of Service</h2><p>Your terms here.</p>");
  });

  // Facebook OAuth routes (direct routes, no /api prefix) - only if credentials are available
  if (process.env.FB_APP_ID && process.env.FB_APP_SECRET) {
    app.get(
      "/auth/facebook",
      require("passport").authenticate("facebook", { scope: ["email"] }),
    );

    app.get(
      "/auth/facebook/callback",
      require("passport").authenticate("facebook", {
        failureRedirect: "/login",
      }),
      (req, res) => {
        res.send("Facebook Login Success");
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

  // API Routes with /api prefix (apply rate limiting)
  try {
    // Auth routes (stricter rate limiting)
    app.use("/api/auth", authLimiter, require("./routes/auth"));

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
    logger.info("✅ Scheduled jobs started");
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
    console.log("Server is running on port " + PORT);
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
