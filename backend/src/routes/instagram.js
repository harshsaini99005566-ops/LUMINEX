const express = require("express");
const InstagramAccount = require("../models/InstagramAccount");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { authenticate } = require("../middleware/auth");
const { sendMessage: sendInstagramMessage } = require("../services/instagram");
const {
  checkAccountLimit,
  checkMessageLimit,
} = require("../middleware/subscription");

const router = express.Router();

// Connect Instagram Account
router.post(
  "/connect",
  authenticate,
  checkAccountLimit,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { instagramUserId, accessToken, username } = req.body;

      // Plan limits enforced by middleware

      // Check if already connected
      const existing = await InstagramAccount.findOne({
        userId,
        instagramUserId,
      });

      if (existing) {
        return res.status(400).json({ error: "Account already connected" });
      }

      // Create connection
      const account = await InstagramAccount.create({
        userId,
        instagramUserId,
        accessToken,
        username,
        isActive: true,
        connectedAt: new Date(),
      });

      // Update user usage (ensure the user is loaded)
      const user = await User.findById(userId);
      if (user) {
        user.usage = user.usage || {};
        user.usage.accountsUsed = (user.usage.accountsUsed || 0) + 1;
        await user.save();
      }

      res.status(201).json({
        message: "Instagram account connected",
        account: {
          id: account._id,
          username: account.username,
          instagramUserId: account.instagramUserId,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get user's Instagram accounts
router.get("/accounts", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const accounts = await InstagramAccount.find({
      user: userId,
      isActive: true,
    }).select("-accessToken");

    res.json({ success: true, data: accounts });
  } catch (error) {
    next(error);
  }
});

// Disconnect Instagram Account
router.delete("/accounts/:accountId", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { accountId } = req.params;

    const account = await InstagramAccount.findOne({
      _id: accountId,
      user: userId,
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    account.isActive = false;
    await account.save();

    // Update user usage
    const user = await User.findById(userId);
    user.usage.accountsUsed = Math.max(0, user.usage.accountsUsed - 1);
    await user.save();

    res.json({ message: "Account disconnected" });
  } catch (error) {
    next(error);
  }
});

// Get conversations for an account
router.get(
  "/accounts/:accountId/conversations",
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { accountId } = req.params;

      // Verify account ownership
      const account = await InstagramAccount.findOne({
        _id: accountId,
        user: userId,
      });

      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }

      const conversations = await Conversation.find({
        user: userId,
        account: accountId,
        isActive: true,
      })
        .sort({ lastMessageAt: -1 })
        .limit(50);

      res.json({ conversations });
    } catch (error) {
      next(error);
    }
  },
);

// Get messages in conversation
router.get(
  "/conversations/:conversationId/messages",
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { conversationId } = req.params;

      // Verify conversation ownership
      const conversation = await Conversation.findOne({
        _id: conversationId,
        user: userId,
      });

      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const messages = await Message.find({
        conversation: conversationId,
      })
        .sort({ createdAt: 1 })
        .limit(100);

      res.json({ messages });
    } catch (error) {
      next(error);
    }
  },
);

// Send manual reply
router.post(
  "/conversations/:conversationId/reply",
  authenticate,
  checkMessageLimit,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { conversationId } = req.params;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ error: "Message content required" });
      }

      const conversation = await Conversation.findOne({
        _id: conversationId,
        user: userId,
      });

      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const account = await InstagramAccount.findById(conversation.account);

      if (!account) {
        return res.status(404).json({ error: "Instagram account not found" });
      }

      // Send message
      const result = await sendInstagramMessage(
        account.accessToken,
        conversation.participantId,
        content,
      );

      // Save message
      await Message.create({
        user: userId,
        account: conversation.account,
        conversation: conversationId,
        instagramSenderId: account.instagramUserId || account.instagramId,
        senderUsername: account.username,
        content,
        direction: "outgoing",
        processedAt: new Date(),
      });

      // Update conversation
      conversation.manualReplies += 1;
      conversation.messageCount = (conversation.messageCount || 0) + 1;
      conversation.lastMessage = content;
      conversation.lastMessageAt = new Date();
      conversation.lastReplyAt = new Date();
      await conversation.save();

      // Update user usage
      const user = await User.findById(userId);
      user.usage.messagesThisMonth += 1;
      await user.save();

      res.json({
        message: "Reply sent",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Send message to participant
router.post(
  "/send-message",
  authenticate,
  checkMessageLimit,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { accountId, participantId, message: messageContent } = req.body;

      if (!accountId || !participantId || !messageContent) {
        return res.status(400).json({
          error: "accountId, participantId, and message are required",
        });
      }

      // Verify account ownership
      const account = await InstagramAccount.findOne({
        _id: accountId,
        user: userId,
      });

      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }

      // Find or create conversation
      let conversation = await Conversation.findOne({
        user: userId,
        account: accountId,
        participantId,
        isActive: true,
      });

      if (!conversation) {
        conversation = await Conversation.create({
          user: userId,
          account: accountId,
          participantId,
          conversationId: `${account.instagramUserId || account.instagramId}_${participantId}`,
          participantUsername: "", // Will be filled from webhook data
          isActive: true,
        });
      }

      // Send message via Meta API
      const result = await sendInstagramMessage(
        account.accessToken,
        participantId,
        messageContent,
      );

      // Save message
      const savedMessage = await Message.create({
        user: userId,
        account: accountId,
        conversation: conversation._id,
        instagramSenderId: account.instagramUserId || account.instagramId,
        senderUsername: account.username,
        content: messageContent,
        direction: "outgoing",
        instagramMessageId: result.message_id || null,
        processedAt: new Date(),
      });

      // Update conversation
      conversation.messageCount = (conversation.messageCount || 0) + 1;
      conversation.lastMessage = messageContent;
      conversation.lastMessageAt = new Date();
      conversation.manualReplies = (conversation.manualReplies || 0) + 1;
      conversation.lastReplyAt = new Date();
      await conversation.save();

      // Update user usage
      const user = await User.findById(userId);
      user.usage.messagesThisMonth = (user.usage.messagesThisMonth || 0) + 1;
      await user.save();

      res.json({
        success: true,
        message: "Message sent",
        messageId: savedMessage._id,
        instagramMessageId: result.message_id,
      });
    } catch (error) {
      console.error("Send message error:", error);
      next(error);
    }
  },
);

module.exports = router;
