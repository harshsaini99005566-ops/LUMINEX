const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: String,
      enum: ['free', 'starter', 'pro', 'agency'],
      required: true,
    },
    stripeSubscriptionId: String,
    stripeCustomerId: String,
    status: {
      type: String,
      enum: ['active', 'paused', 'canceled', 'past_due'],
      default: 'active',
    },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    canceledAt: Date,
    trialStartsAt: Date,
    trialEndsAt: Date,
    isOnTrial: {
      type: Boolean,
      default: false,
    },
    price: Number,
    currency: {
      type: String,
      default: 'usd',
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ user: 1 });
subscriptionSchema.index(
  { stripeSubscriptionId: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
