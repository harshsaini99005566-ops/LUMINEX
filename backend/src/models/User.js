const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: false, // Not required for OAuth users
      minlength: 8,
      select: false,
    },
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    // Facebook OAuth fields
    facebookId: {
      type: String,
      unique: true,
      sparse: true, // Allow null values
    },
    facebookAccessToken: {
      type: String,
      select: false, // Don't include in queries by default
    },
    facebookPages: [{
      pageId: String,
      pageName: String,
      hasInstagram: Boolean,
    }],
    authProvider: {
      type: String,
      enum: ['local', 'facebook', 'google'],
      default: 'local'
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    plan: {
      type: String,
      enum: ['free', 'starter', 'pro', 'agency'],
      default: 'free',
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    billingEmail: String,
    trialEndsAt: Date,
    subscriptionStatus: { type: String, default: 'none' },
    limits: {
      instagramAccounts: { type: Number, default: 1 },
      automationRules: { type: Number, default: 5 },
      aiReplies: { type: Number, default: 100 },
      monthlyMessages: { type: Number, default: 1000 },
    },
    usage: {
      accountsUsed: { type: Number, default: 0 },
      rulesUsed: { type: Number, default: 0 },
      aiRepliesUsed: { type: Number, default: 0 },
      messagesThisMonth: { type: Number, default: 0 },
      lastResetDate: { type: Date, default: Date.now },
    },
    apiKey: String,
    twoFactorEnabled: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    instagramOAuthState: String, // CSRF token for OAuth flow
    instagramOAuthStateExpires: Date, // Timestamp when state expires
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Skip if password is not modified or doesn't exist (OAuth users)
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check plan limits
userSchema.methods.canAddAccount = function () {
  return this.usage.accountsUsed < this.limits.instagramAccounts;
};

userSchema.methods.canAddRule = function () {
  return this.usage.rulesUsed < this.limits.automationRules;
};

userSchema.methods.canUseAI = function () {
  return this.usage.aiRepliesUsed < this.limits.aiReplies;
};

// Check monthly messages limit
userSchema.methods.canSendMessage = function (count = 1) {
  // reset monthly counters if month changed
  const now = new Date();
  const last = this.usage.lastResetDate || new Date(0);
  if (last.getUTCFullYear() !== now.getUTCFullYear() || last.getUTCMonth() !== now.getUTCMonth()) {
    this.usage.messagesThisMonth = 0;
    this.usage.aiRepliesUsed = 0;
    this.usage.lastResetDate = now;
  }
  return this.usage.messagesThisMonth + count <= this.limits.monthlyMessages;
};

userSchema.methods.incrementMessages = async function (count = 1) {
  const now = new Date();
  const last = this.usage.lastResetDate || new Date(0);
  if (last.getUTCFullYear() !== now.getUTCFullYear() || last.getUTCMonth() !== now.getUTCMonth()) {
    this.usage.messagesThisMonth = 0;
    this.usage.aiRepliesUsed = 0;
    this.usage.lastResetDate = now;
  }
  this.usage.messagesThisMonth += count;
  return this.save();
};

userSchema.methods.incrementAIReplies = async function (count = 1) {
  const now = new Date();
  const last = this.usage.lastResetDate || new Date(0);
  if (last.getUTCFullYear() !== now.getUTCFullYear() || last.getUTCMonth() !== now.getUTCMonth()) {
    this.usage.messagesThisMonth = 0;
    this.usage.aiRepliesUsed = 0;
    this.usage.lastResetDate = now;
  }
  this.usage.aiRepliesUsed += count;
  this.usage.messagesThisMonth += count;
  return this.save();
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
