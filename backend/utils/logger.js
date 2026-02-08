const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Log levels
 */
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

/**
 * Get current log level from environment
 */
const getCurrentLogLevel = () => {
  const envLevel = process.env.LOG_LEVEL || 'info';
  return logLevels[envLevel] || logLevels.info;
};

/**
 * Format log message
 */
const formatLog = (level, message, data) => {
  const timestamp = new Date().toISOString();
  return JSON.stringify({
    timestamp,
    level: level.toUpperCase(),
    message,
    ...(Object.keys(data).length > 0 && { data }),
  });
};

/**
 * Write to file
 */
const writeToFile = (filename, content) => {
  try {
    const filepath = path.join(logsDir, filename);
    fs.appendFileSync(filepath, content + '\n', 'utf8');
  } catch (error) {
    console.error('Failed to write log file:', error);
  }
};

/**
 * Logger class with production features
 */
class Logger {
  constructor(name = 'app') {
    this.name = name;
    this.currentLogLevel = getCurrentLogLevel();
  }

  log(level, message, data = {}) {
    // Check if we should log this level
    if (logLevels[level] > this.currentLogLevel) {
      return;
    }

    const formattedLog = formatLog(level, message, data);

    // Console output
    const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    console[consoleMethod](formattedLog);

    // File output (all levels)
    writeToFile('combined.log', formattedLog);

    // Separate error log
    if (level === 'error') {
      writeToFile('error.log', formattedLog);
    }

    // Production error monitoring
    if (process.env.NODE_ENV === 'production' && level === 'error') {
      this.sendToMonitoring(message, data);
    }
  }

  error(message, data = {}) {
    if (data instanceof Error) {
      data = {
        message: data.message,
        stack: data.stack,
      };
    }
    this.log('error', message, data);
  }

  warn(message, data = {}) {
    this.log('warn', message, data);
  }

  info(message, data = {}) {
    this.log('info', message, data);
  }

  debug(message, data = {}) {
    this.log('debug', message, data);
  }

  /**
   * Log performance metrics
   */
  performance(operation, durationMs, data = {}) {
    const level = durationMs > 5000 ? 'warn' : 'info';
    this.log(level, `Performance: ${operation}`, {
      ...data,
      duration: `${durationMs}ms`,
    });
  }

  /**
   * Log API request
   */
  apiRequest(method, path, statusCode, durationMs, userId = null) {
    const level = statusCode >= 400 ? 'warn' : 'info';
    this.log(level, 'API Request', {
      method,
      path,
      statusCode,
      duration: `${durationMs}ms`,
      ...(userId && { userId }),
    });
  }

  /**
   * Log database operation
   */
  database(operation, collection, durationMs, data = {}) {
    const level = durationMs > 1000 ? 'warn' : 'info';
    this.log(level, `Database: ${operation}`, {
      ...data,
      collection,
      duration: `${durationMs}ms`,
    });
  }

  /**
   * Send critical errors to monitoring service
   */
  sendToMonitoring(message, data) {
    try {
      // Integration point for Sentry, DataDog, New Relic, etc.
      if (process.env.MONITORING_ENABLED === 'true') {
        const event = {
          timestamp: new Date().toISOString(),
          level: 'error',
          message,
          data,
          environment: process.env.NODE_ENV,
          version: process.env.APP_VERSION || '1.0.0',
        };
        // Placeholder for monitoring service integration
      }
    } catch (error) {
      console.error('Failed to send to monitoring:', error);
    }
  }

  /**
   * Get log files list
   */
  getLogFiles() {
    try {
      return fs.readdirSync(logsDir).map((file) => ({
        name: file,
        size: fs.statSync(path.join(logsDir, file)).size,
        path: path.join(logsDir, file),
      }));
    } catch (error) {
      this.error('Failed to get log files', error);
      return [];
    }
  }

  /**
   * Rotate log files older than specified days
   */
  rotateLogs(maxAgeDays = 7) {
    try {
      const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
      const now = Date.now();

      const files = fs.readdirSync(logsDir);
      for (const file of files) {
        const filepath = path.join(logsDir, file);
        const stats = fs.statSync(filepath);
        if (now - stats.mtime.getTime() > maxAgeMs) {
          fs.unlinkSync(filepath);
          this.info('Rotated log file', { file });
        }
      }
    } catch (error) {
      this.error('Failed to rotate logs', error);
    }
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    try {
      const files = fs.readdirSync(logsDir);
      for (const file of files) {
        fs.unlinkSync(path.join(logsDir, file));
      }
      this.info('All logs cleared');
    } catch (error) {
      this.error('Failed to clear logs', error);
    }
  }
}

// Create default logger instance
const logger = new Logger('autodm-saas');

// Rotate logs daily
if (process.env.LOG_ROTATION_ENABLED !== 'false') {
  setInterval(() => {
    logger.rotateLogs(parseInt(process.env.LOG_MAX_AGE_DAYS || 7));
  }, 24 * 60 * 60 * 1000); // Every 24 hours
}

module.exports = logger;
