const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstagramAccount",
      required: true,
    },
    conversationId: {
      type: String,
      required: true,
      unique: true,
    },
    participantId: String,
    participantUsername: String,
    participantProfilePic: String,
    participantBio: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    isSpam: {
      type: Boolean,
      default: false,
    },
    isPriority: {
      type: Boolean,
      default: false,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    automatedReplies: {
      type: Number,
      default: 0,
    },
    manualReplies: {
      type: Number,
      default: 0,
    },
    lastMessageAt: Date,
    lastReplyAt: Date,
    unreadCount: {
      type: Number,
      default: 0,
    },
    lastMessage: String,
    overallSentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: "neutral",
    },
    tags: [String],
  },
  {
    timestamps: true,
  },
);

conversationSchema.index({ user: 1, account: 1, updatedAt: -1 });
conversationSchema.index({ user: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);
