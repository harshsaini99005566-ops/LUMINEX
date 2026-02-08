require("dotenv").config();

const requiredEnvVars = ["NODE_ENV", "PORT", "MONGODB_URI", "JWT_SECRET"];

// Optional in development, required in production
const conditionalEnvVars = {
  INSTAGRAM_APP_ID: ["production"],
  INSTAGRAM_APP_SECRET: ["production"],
  INSTAGRAM_WEBHOOK_VERIFY_TOKEN: ["production"],
  // STRIPE_SECRET_KEY: ["production"], // Disabled for now
  // STRIPE_PUBLISHABLE_KEY: ["production"], // Disabled for now
};

const validateEnv = () => {
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  // Check conditional env vars based on environment
  const nodeEnv = process.env.NODE_ENV || "development";
  Object.entries(conditionalEnvVars).forEach(([envVar, requiredInEnvs]) => {
    if (requiredInEnvs.includes(nodeEnv) && !process.env[envVar]) {
      throw new Error(
        `Missing required environment variable for ${nodeEnv}: ${envVar}`,
      );
    }
  });

  // Validate environment values
  if (
    !["development", "staging", "production"].includes(process.env.NODE_ENV)
  ) {
    throw new Error("NODE_ENV must be development, staging, or production");
  }

  if (isNaN(parseInt(process.env.PORT))) {
    throw new Error("PORT must be a valid number");
  }

  if (process.env.NODE_ENV === "production") {
    if (process.env.JWT_SECRET.length < 32) {
      throw new Error(
        "JWT_SECRET must be at least 32 characters in production",
      );
    }
  }
};

const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT) || 5000,
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isStaging: process.env.NODE_ENV === "staging",

  // Database
  mongodb: {
    uri: process.env.MONGODB_URI,
    maxPoolSize: process.env.DB_POOL_SIZE
      ? parseInt(process.env.DB_POOL_SIZE)
      : 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiry: process.env.JWT_EXPIRY || "7d",
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "30d",
  },
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: process.env.JWT_EXPIRY || "7d",

  // Instagram
  instagram: {
    appId: process.env.INSTAGRAM_APP_ID,
    appSecret: process.env.INSTAGRAM_APP_SECRET,
    webhookToken: process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN,
    apiVersion: process.env.INSTAGRAM_API_VERSION || "v18.0",
    webhookUrl:
      process.env.INSTAGRAM_WEBHOOK_URL ||
      `${process.env.API_URL}/api/webhooks/instagram`,
    // OAuth state TTL in milliseconds (configurable via INSTAGRAM_OAUTH_STATE_TTL_MS; default 10 minutes)
    stateTtlMs:
      parseInt(process.env.INSTAGRAM_OAUTH_STATE_TTL_MS) || 10 * 60 * 1000,
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    freePriceId: process.env.STRIPE_FREE_PRICE_ID,
    starterPriceId: process.env.STRIPE_STARTER_PRICE_ID,
    proPriceId: process.env.STRIPE_PRO_PRICE_ID,
    agencyPriceId: process.env.STRIPE_AGENCY_PRICE_ID,
  },

  // URLs
  urls: {
    frontend: process.env.FRONTEND_URL || "http://localhost:3000",
    api: process.env.API_URL || "http://localhost:5001",
    production: process.env.PRODUCTION_URL,
  },

  // Backwards-compatible top-level URL fields for other modules
  frontendUrl:
    process.env.FRONTEND_URL ||
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    "http://localhost:3000",
  apiUrl: process.env.API_URL || "http://localhost:5001",

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "info",
    rotationEnabled: process.env.LOG_ROTATION_ENABLED !== "false",
    maxAgeDays: parseInt(process.env.LOG_MAX_AGE_DAYS) || 7,
  },

  // Rate Limiting
  rateLimit: {
    authWindowMs: 15 * 60 * 1000, // 15 minutes
    authMaxRequests: parseInt(process.env.RATE_LIMIT_AUTH_MAX) || 5,
    apiWindowMs: 15 * 60 * 1000,
    apiMaxRequests: parseInt(process.env.RATE_LIMIT_API_MAX) || 100,
    strictWindowMs: 60 * 1000,
    strictMaxRequests: parseInt(process.env.RATE_LIMIT_STRICT_MAX) || 10,
  },

  // Security
  security: {
    bcryptRounds: 12,
    cors: {
      credentials: true,
      maxAge: 3600,
    },
    bodyLimit: "10mb",
    enableHttp2: process.env.ENABLE_HTTP2 !== "false",
  },

  // Performance
  performance: {
    enableCompression: process.env.ENABLE_COMPRESSION !== "false",
    enableCaching: process.env.ENABLE_CACHING !== "false",
    cacheMaxAge: parseInt(process.env.CACHE_MAX_AGE) || 3600,
  },

  // Feature Flags
  features: {
    analyticsEnabled: process.env.ANALYTICS_ENABLED === "true",
    webhooksEnabled: process.env.WEBHOOKS_ENABLED !== "false",
    billingEnabled: process.env.BILLING_ENABLED !== "false",
    maintenanceMode: process.env.MAINTENANCE_MODE === "true",
  },

  // Monitoring
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === "true",
    sentryDsn: process.env.SENTRY_DSN,
    newrelicKey: process.env.NEW_RELIC_LICENSE_KEY,
    datadogApiKey: process.env.DATADOG_API_KEY,
  },
};

module.exports = {
  validateEnv,
  config,
};
