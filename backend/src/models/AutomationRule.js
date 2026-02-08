const mongoose = require('mongoose');

const automationRuleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InstagramAccount',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
    },
    triggerType: {
      type: String,
      enum: ['keyword', 'direct_message', 'comment', 'mention'],
      default: 'keyword',
    },
    keywords: [
      {
        type: String,
        lowercase: true,
      },
    ],
    hashtags: [String],
    mentions: { type: Boolean, default: false },
    matchType: {
      type: String,
      enum: ['exact', 'contains', 'starts_with'],
      default: 'contains',
    },
    caseSensitive: {
      type: Boolean,
      default: false,
    },
    replyType: {
      type: String,
      enum: ['predefined', 'ai', 'handoff'],
      required: true,
    },
    predefinedReply: String,
    useAI: {
      type: Boolean,
      default: false,
    },
    aiPrompt: String,
    aiTemperature: {
      type: Number,
      min: 0,
      max: 2,
      default: 0.7,
    },
    handoffEmail: String,
    delaySeconds: {
      type: Number,
      default: 0,
    },
    doNotReplyToReplies: {
      type: Boolean,
      default: false,
    },
    maxRepliesPerUser: {
      type: Number,
      default: 0,
    },
    triggerCount: {
      type: Number,
      default: 0,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
    lastTriggered: Date,
  },
  {
    timestamps: true,
  }
);

automationRuleSchema.index({ user: 1, account: 1, isActive: 1 });
automationRuleSchema.index({ user: 1 });

module.exports = mongoose.model('AutomationRule', automationRuleSchema);
