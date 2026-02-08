const mongoose = require('mongoose');
const crypto = require('crypto');

const instagramAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    instagramId: {
      type: String,
      required: true,
      unique: true,
    },
    businessAccountId: {
      type: String,
      unique: true,
      sparse: true,
    },
    pageId: {
      type: String,
      unique: true,
      sparse: true,
    },
    username: {
      type: String,
      required: true,
    },
    name: String,
    biography: String,
    profilePicture: String,
    followersCount: { type: Number, default: 0 },
    websiteUrl: String,
    email: String,
    
    // Token Management (encrypted)
    accessToken: {
      type: String,
      required: true,
      select: false,
      get: function(value) {
        return value ? this.decryptToken(value) : null;
      },
      set: function(value) {
        return value ? this.encryptToken(value) : null;
      },
    },
    refreshToken: {
      type: String,
      select: false,
      get: function(value) {
        return value ? this.decryptToken(value) : null;
      },
      set: function(value) {
        return value ? this.encryptToken(value) : null;
      },
    },
    tokenExpiresAt: Date,
    tokenType: {
      type: String,
      default: 'USER_ACCESS_TOKEN',
      enum: ['USER_ACCESS_TOKEN', 'SYSTEM_USER_TOKEN'],
    },
    lastTokenRefresh: Date,
    
    // Webhook Management
    webhookVerifyToken: {
      type: String,
      select: false,
    },
    webhookSubscribed: {
      type: Boolean,
      default: false,
    },
    webhookSubscriptionFields: {
      type: [String],
      default: ['messages', 'message_echoes', 'message_template_status_update'],
    },
    lastWebhookSubscriptionAt: Date,
    webhookSubscriptionStatus: {
      type: String,
      enum: ['active', 'inactive', 'failed'],
      default: 'inactive',
    },
    
    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    accountStatus: {
      type: String,
      enum: ['connected', 'disconnected', 'error', 'suspended'],
      default: 'connected',
    },
    lastStatusCheck: Date,
    
    // Sync & Metadata
    connectedAt: {
      type: Date,
      default: Date.now,
    },
    disconnectedAt: Date,
    lastSyncedAt: Date,
    syncStatus: {
      type: String,
      enum: ['syncing', 'synced', 'failed', 'idle'],
      default: 'synced',
    },
    
    // Rate Limiting
    messagingLimitResetTime: Date,
    messagesSentToday: { type: Number, default: 0 },
    dailyMessageLimit: { type: Number, default: 100 },
    
    // Error Tracking
    lastError: String,
    lastErrorAt: Date,
    errorCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    getters: true,
  }
);

// Indexes for performance
instagramAccountSchema.index({ user: 1 });
instagramAccountSchema.index({ instagramId: 1 });
instagramAccountSchema.index({ businessAccountId: 1 });
instagramAccountSchema.index({ pageId: 1 });
instagramAccountSchema.index({ username: 1 });
instagramAccountSchema.index({ webhookSubscribed: 1 });
instagramAccountSchema.index({ accountStatus: 1 });
instagramAccountSchema.index({ createdAt: -1 });

// Token encryption/decryption methods
instagramAccountSchema.methods.encryptToken = function(token) {
  if (!token) return null;
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(process.env.TOKEN_ENCRYPTION_KEY || 'default-key', 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

instagramAccountSchema.methods.decryptToken = function(encryptedToken) {
  if (!encryptedToken || !encryptedToken.includes(':')) return null;
  try {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.TOKEN_ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const [iv, authTag, encrypted] = encryptedToken.split(':');
    
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Token decryption failed:', error.message);
    return null;
  }
};

// Middleware to check if token refresh is needed
instagramAccountSchema.methods.isTokenExpired = function() {
  if (!this.tokenExpiresAt) return false;
  return new Date() > this.tokenExpiresAt;
};

instagramAccountSchema.methods.updateMessageCount = function() {
  const now = new Date();
  
  // Reset daily count if it's a new day
  if (this.messagingLimitResetTime) {
    const resetDate = new Date(this.messagingLimitResetTime);
    if (now.toDateString() !== resetDate.toDateString()) {
      this.messagesSentToday = 0;
      this.messagingLimitResetTime = now;
    }
  } else {
    this.messagingLimitResetTime = now;
  }
  
  this.messagesSentToday += 1;
};

instagramAccountSchema.methods.canSendMessage = function() {
  return this.messagesSentToday < this.dailyMessageLimit;
};

module.exports = mongoose.model('InstagramAccount', instagramAccountSchema);
