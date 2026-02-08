const axios = require('axios');
const crypto = require('crypto');
const logger = require('../../utils/logger');
const { config } = require('../config/env');

const API_BASE = `https://graph.instagram.com/${config.instagram.apiVersion}`;
const GRAPH_API_VERSION = config.instagram.apiVersion || 'v18.0';

// Main API client
const instagramAPI = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Business API client (for account-level operations)
const businessAPI = axios.create({
  baseURL: `https://graph.instagram.com/${GRAPH_API_VERSION}`,
  timeout: 10000,
});

// Send message via Instagram
const sendMessage = async (accessToken, recipientId, message) => {
  try {
    const response = await instagramAPI.post('/me/messages', {
      recipient: { id: recipientId },
      message: { text: message },
      access_token: accessToken,
    });

    logger.info(`Message sent to ${recipientId}`);
    return response.data;
  } catch (error) {
    logger.error('Error sending Instagram message', error);
    throw error;
  }
};

// Get conversations
const getConversations = async (accessToken) => {
  try {
    const response = await instagramAPI.get('/me/conversations', {
      params: {
        access_token: accessToken,
        fields: 'id,senders,participants,wallpaper,former_participants',
      },
    });

    return response.data.data || [];
  } catch (error) {
    logger.error('Error fetching conversations', error);
    throw error;
  }
};

// Get conversation messages
const getConversationMessages = async (accessToken, conversationId) => {
  try {
    const response = await instagramAPI.get(`/${conversationId}/messages`, {
      params: {
        access_token: accessToken,
        fields: 'id,from,to,message,type,created_timestamp',
      },
    });

    return response.data.data || [];
  } catch (error) {
    logger.error('Error fetching messages', error);
    throw error;
  }
};

// Get user info
const getUserInfo = async (accessToken, userId) => {
  try {
    const response = await instagramAPI.get(`/${userId}`, {
      params: {
        access_token: accessToken,
        fields: 'id,name,profile_picture_url,username,biography,followers_count,website',
      },
    });

    return response.data;
  } catch (error) {
    logger.error('Error fetching user info', error);
    throw error;
  }
};

// Subscribe to webhooks
const subscribeToWebhook = async (accessToken, pageId) => {
  try {
    const response = await instagramAPI.post(`/${pageId}/subscribed_apps`, {
      access_token: accessToken,
    });

    logger.info(`Webhooks subscribed for page ${pageId}`);
    return response.data;
  } catch (error) {
    logger.error('Error subscribing to webhooks', error);
    throw error;
  }
};

// Refresh access token
const refreshAccessToken = async (userId, refreshToken) => {
  try {
    const response = await instagramAPI.get('/refresh_access_token', {
      params: {
        grant_type: 'ig_refresh_token',
        access_token: refreshToken,
      },
    });

    logger.info(`Access token refreshed for user ${userId}`);
    return response.data.access_token;
  } catch (error) {
    logger.error('Error refreshing token', error);
    throw error;
  }
};

// Webhook signature verification
const verifyWebhookSignature = (body, signature) => {
  try {
    const appSecret = config.instagram.appSecret;
    if (!appSecret) {
      logger.warn('Instagram app secret not configured');
      return false;
    }

    const hash = crypto
      .createHmac('sha256', appSecret)
      .update(body)
      .digest('hex');

    return hash === signature;
  } catch (error) {
    logger.error('Error verifying webhook signature', error);
    return false;
  }
};

// Get Instagram Business Account info
const getBusinessAccountInfo = async (accessToken, instagramBusinessAccountId) => {
  try {
    const response = await businessAPI.get(`/${instagramBusinessAccountId}`, {
      params: {
        access_token: accessToken,
        fields: 'id,name,biography,profile_picture_url,website,followers_count,ig_media_count,ig_mention_count',
      },
    });

    logger.info(`Business account info fetched: ${instagramBusinessAccountId}`);
    return response.data;
  } catch (error) {
    logger.error('Error fetching business account info', error);
    throw error;
  }
};

// Get access token from OAuth code
const getAccessTokenFromCode = async (code) => {
  try {
    const response = await axios.post(
      'https://graph.instagram.com/v18.0/oauth/access_token',
      {
        client_id: config.instagram.appId,
        client_secret: config.instagram.appSecret,
        grant_type: 'authorization_code',
        redirect_uri: config.instagram.redirectUri,
        code,
      }
    );

    logger.info('Access token obtained from authorization code');
    return {
      accessToken: response.data.access_token,
      userId: response.data.user_id,
    };
  } catch (error) {
    logger.error('Error exchanging authorization code for token', error);
    throw error;
  }
};

// Get long-lived access token from short-lived token
const exchangeAccessToken = async (accessToken) => {
  try {
    const response = await businessAPI.get('/oauth/access_token', {
      params: {
        client_id: config.instagram.appId,
        client_secret: config.instagram.appSecret,
        grant_type: 'ig_refresh_token',
        access_token: accessToken,
      },
    });

    logger.info('Access token exchanged for long-lived token');
    return {
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in,
    };
  } catch (error) {
    logger.error('Error exchanging token', error);
    throw error;
  }
};

// Get Instagram Business Account ID from User ID
const getInstagramBusinessAccountId = async (userId, accessToken) => {
  try {
    const response = await businessAPI.get(`/${userId}/instagram_business_accounts`, {
      params: {
        access_token: accessToken,
      },
    });

    if (response.data.data && response.data.data.length > 0) {
      logger.info(`Found ${response.data.data.length} Instagram business accounts`);
      return response.data.data[0].id;
    }

    logger.warn(`No Instagram business accounts found for user ${userId}`);
    throw new Error('No Instagram business account found');
  } catch (error) {
    logger.error('Error fetching Instagram business account ID', error);
    throw error;
  }
};

// Send media message (image/video)
const sendMediaMessage = async (accessToken, recipientId, mediaUrl, mediaType = 'image') => {
  try {
    const payload = {
      recipient: { id: recipientId },
      message: {
        attachment: {
          type: 'image',
          payload: {
            url: mediaUrl,
          },
        },
      },
      access_token: accessToken,
    };

    if (mediaType === 'video') {
      payload.message.attachment.type = 'video';
    }

    const response = await instagramAPI.post('/me/messages', payload);

    logger.info(`Media message sent to ${recipientId}`);
    return response.data;
  } catch (error) {
    logger.error('Error sending media message', error);
    throw error;
  }
};

// Send carousel message (multiple items)
const sendCarouselMessage = async (accessToken, recipientId, items) => {
  try {
    const response = await instagramAPI.post('/me/messages', {
      recipient: { id: recipientId },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'carousel',
            elements: items,
          },
        },
      },
      access_token: accessToken,
    });

    logger.info(`Carousel message sent to ${recipientId}`);
    return response.data;
  } catch (error) {
    logger.error('Error sending carousel message', error);
    throw error;
  }
};

// Handle incoming webhook event (message received)
const processIncomingMessage = async (event) => {
  try {
    const {
      messaging: [{ sender, recipient, message, timestamp }],
    } = event;

    if (!message) {
      return null;
    }

    const messageData = {
      from: sender.id,
      to: recipient.id,
      text: message.text || null,
      type: message.attachment ? 'media' : 'text',
      externalId: message.mid,
      timestamp: new Date(parseInt(timestamp)),
      metadata: {
        attachments: message.attachment || null,
        quickReply: message.quick_reply || null,
      },
    };

    logger.info(`Incoming message from ${sender.id}`);
    return messageData;
  } catch (error) {
    logger.error('Error processing incoming message', error);
    return null;
  }
};

// Handle incoming webhook event (message delivery/read)
const processMessageStatus = async (event) => {
  try {
    let status = null;
    let messageId = null;

    if (event.delivery) {
      status = 'delivered';
      messageId = event.delivery.mids[0];
    } else if (event.read) {
      status = 'read';
      messageId = event.read.mids[0];
    }

    if (status && messageId) {
      logger.info(`Message status update: ${status} for message ${messageId}`);
      return { messageId, status };
    }

    return null;
  } catch (error) {
    logger.error('Error processing message status', error);
    return null;
  }
};

// Get message insights (optional feature)
const getMessageInsights = async (accessToken, instagramBusinessAccountId) => {
  try {
    const response = await businessAPI.get(
      `/${instagramBusinessAccountId}/insights`,
      {
        params: {
          access_token: accessToken,
          metric: 'messages_conversation_initiated_count,messages_response_rate',
          period: 'day',
        },
      }
    );

    logger.info('Message insights fetched');
    return response.data;
  } catch (error) {
    logger.error('Error fetching message insights', error);
    throw error;
  }
}

module.exports = {
  sendMessage,
  sendMediaMessage,
  sendCarouselMessage,
  getConversations,
  getConversationMessages,
  getUserInfo,
  getBusinessAccountInfo,
  getInstagramBusinessAccountId,
  subscribeToWebhook,
  refreshAccessToken,
  getAccessTokenFromCode,
  exchangeAccessToken,
  verifyWebhookSignature,
  processIncomingMessage,
  processMessageStatus,
  getMessageInsights,
};
