const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Track DB connection state
let isConnected = false;

const connectDB = async () => {
  // Return early if already connecting or connected
  if (isConnected) {
    logger.info('MongoDB already connected');
    return mongoose.connection;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      logger.error('MONGODB_URI is not defined in environment variables');
      process.exit(1);
    }

    // Prefer 127.0.0.1 over localhost on Windows to avoid name-resolution issues
    let mongoUriToUse = mongoUri;
    if (/^mongodb:/.test(mongoUri) && mongoUri.includes('localhost')) {
      mongoUriToUse = mongoUri.replace(/localhost/g, '127.0.0.1');
      logger.warn('Replacing localhost with 127.0.0.1 in MONGODB_URI for Windows compatibility');
    }

    logger.info('🔄 Attempting MongoDB connection...');
    console.log('Connecting to:', mongoUriToUse.split('@')[1] || mongoUriToUse);

    const connectOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false, // Disable command buffering to prevent timeout issues
      retryWrites: true,
      w: 'majority',
    };

    logger.info(`MongoDB options: serverSelectionTimeoutMS=${connectOptions.serverSelectionTimeoutMS}, connectTimeoutMS=${connectOptions.connectTimeoutMS}`);

    // Attempt connection; fail fast if it fails
    await mongoose.connect(mongoUriToUse, connectOptions);

    isConnected = true;

    logger.info('✅ MongoDB connected successfully');
    logger.info(`Connected to database: ${mongoose.connection.name} @ ${mongoose.connection.host}`);

    // Confirm socket is open
    mongoose.connection.once('open', () => {
      logger.info('MongoDB connection open — waiting for connections');
    });

    // Setup connection event handlers
    mongoose.connection.on('error', (error) => {
      isConnected = false;
      logger.error('❌ MongoDB connection error:', error.message);
      // Fail fast to surface DB issues during startup
      process.exit(1);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      logger.info('✅ MongoDB reconnected');
    });

    return mongoose.connection;
  } catch (error) {
    isConnected = false;
    logger.error('❌ MongoDB connection failed:', error.message);

    // Log detailed error info
    if (error.name === 'MongoAuthenticationError') {
      logger.error('Authentication failed. Check MONGODB_URI credentials in .env');
    } else if (error.name === 'MongoServerSelectionError') {
      logger.error('Cannot reach MongoDB server. Check connection string and network.');
    }

    logger.error('Exiting process due to MongoDB connection failure.');
    process.exit(1);
  }
};

const getDBStatus = () => ({
  connected: isConnected,
  database: isConnected ? mongoose.connection.name : null,
  host: isConnected ? mongoose.connection.host : null,
});

module.exports = {
  connectDB,
  getDBStatus,
  isConnected: () => isConnected,
};
