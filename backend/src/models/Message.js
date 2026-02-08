const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InstagramAccount',
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    instagramMessageId: String,
    instagramSenderId: String,
    senderUsername: String,
    senderProfilePic: String,
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'carousel', 'unknown'],
      default: 'text',
    },
    content: String,
    mediaUrl: String,
    processedAt: Date,
    ruleTrigger: String,
    automationRule: mongoose.Schema.Types.ObjectId,
    processedByAI: Boolean,
    hasReply: Boolean,
    replyType: String,
    replyContent: String,
    sentAt: Date,
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral',
    },
    sentimentScore: Number,
    direction: {
      type: String,
      enum: ['incoming', 'outgoing'],
      default: 'incoming',
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ user: 1, conversation: 1, createdAt: -1 });
messageSchema.index({ instagramMessageId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Message', messageSchema);
