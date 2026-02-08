/**
 * Meta Business Account API Service
 * Comprehensive integration with Meta Graph API v18.0+
 * Handles messaging, media, templates, and account management
 */

const axios = require('axios');
const logger = require('../../utils/logger');


const API_VERSION = process.env.INSTAGRAM_API_VERSION || 'v18.0';
const GRAPH_API = `https://graph.instagram.com/${API_VERSION}`;

// Create axios instance with retry logic
const createMetaClient = (accessToken) => {
  return axios.create({
    baseURL: GRAPH_API,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });
};

/**
 * Get Business Account ID from Instagram User ID
 * @param {string} accessToken - OAuth access token
 * @param {string} instagramId - Instagram user ID
 * @returns {Promise<string>} Business account ID
 */
const getBusinessAccountId = async (accessToken, instagramId) => {
  try {
    const response = await axios.get(`${GRAPH_API}/${instagramId}`, {
      params: {
        fields: 'ig_business_account',
        access_token: accessToken,
      },
    });

    const businessAccountId = response.data.ig_business_account?.id;
    if (!businessAccountId) {
      throw new Error('No business account associated with this Instagram account');
    }

    return businessAccountId;
  } catch (error) {
    logger.error('[Meta API] Failed to get business account ID:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Send text message
 * @param {string} accessToken - Access token
 * @param {string} businessAccountId - Business account ID
 * @param {string} recipientId - Recipient PSID or phone number
 * @param {string} text - Message text
 * @returns {Promise<Object>} Message response
 */
const sendTextMessage = async (accessToken, businessAccountId, recipientId, text) => {
  try {
    logger.info('[Meta API] Sending text message', {
      businessAccountId,
      recipientId: recipientId.substring(0, 10),
    });

    const client = createMetaClient(accessToken);
    const response = await client.post(`/${businessAccountId}/messages`, {
      recipient: { id: recipientId },
      message: { text },
    });

    logger.info('[Meta API] Message sent', { messageId: response.data.message_id });
    return {
      messageId: response.data.message_id,
      timestamp: new Date(),
    };
  } catch (error) {
    logger.error('[Meta API] Send message failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Send rich message with quick replies
 * @param {string} accessToken - Access token
 * @param {string} businessAccountId - Business account ID
 * @param {string} recipientId - Recipient PSID
 * @param {string} text - Message text
 * @param {Array} quickReplies - Array of quick reply objects
 * @returns {Promise<Object>} Message response
 */
const sendQuickReplyMessage = async (
  accessToken,
  businessAccountId,
  recipientId,
  text,
  quickReplies
) => {
  try {
    logger.info('[Meta API] Sending quick reply message', {
      businessAccountId,
      recipientId: recipientId.substring(0, 10),
      quickReplyCount: quickReplies.length,
    });

    const client = createMetaClient(accessToken);
    const response = await client.post(`/${businessAccountId}/messages`, {
      recipient: { id: recipientId },
      message: {
        text,
        quick_replies: quickReplies.map((reply) => ({
          content_type: 'text',
          title: reply.title,
          payload: reply.payload || reply.title,
        })),
      },
    });

    logger.info('[Meta API] Quick reply message sent', { messageId: response.data.message_id });
    return {
      messageId: response.data.message_id,
      timestamp: new Date(),
    };
  } catch (error) {
    logger.error('[Meta API] Send quick reply failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Send template message
 * @param {string} accessToken - Access token
 * @param {string} businessAccountId - Business account ID
 * @param {string} recipientId - Recipient PSID
 * @param {string} templateName - Name of the registered template
 * @param {Array} parameters - Template parameters
 * @returns {Promise<Object>} Message response
 */
const sendTemplateMessage = async (
  accessToken,
  businessAccountId,
  recipientId,
  templateName,
  parameters = []
) => {
  try {
    logger.info('[Meta API] Sending template message', {
      businessAccountId,
      templateName,
      recipientId: recipientId.substring(0, 10),
    });

    const client = createMetaClient(accessToken);
    const response = await client.post(`/${businessAccountId}/messages`, {
      recipient: { id: recipientId },
      message: {
        template: {
          name: templateName,
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: parameters.map((param) => ({
                type: 'text',
                text: param,
              })),
            },
          ],
        },
      },
    });

    logger.info('[Meta API] Template message sent', { messageId: response.data.message_id });
    return {
      messageId: response.data.message_id,
      timestamp: new Date(),
    };
  } catch (error) {
    logger.error('[Meta API] Send template message failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Send message with media attachment
 * @param {string} accessToken - Access token
 * @param {string} businessAccountId - Business account ID
 * @param {string} recipientId - Recipient PSID
 * @param {string} mediaType - 'image', 'video', 'audio', 'file'
 * @param {string} mediaUrl - URL to media file
 * @param {string} caption - Optional caption
 * @returns {Promise<Object>} Message response
 */
const sendMediaMessage = async (
  accessToken,
  businessAccountId,
  recipientId,
  mediaType,
  mediaUrl,
  caption = null
) => {
  try {
    logger.info('[Meta API] Sending media message', {
      businessAccountId,
      mediaType,
      recipientId: recipientId.substring(0, 10),
    });

    const client = createMetaClient(accessToken);
    const payload = {
      recipient: { id: recipientId },
      message: {
        attachment: {
          type: mediaType,
          payload: {
            url: mediaUrl,
          },
        },
      },
    };

    if (caption) {
      payload.message.text = caption;
    }

    const response = await client.post(`/${businessAccountId}/messages`, payload);

    logger.info('[Meta API] Media message sent', { messageId: response.data.message_id });
    return {
      messageId: response.data.message_id,
      timestamp: new Date(),
    };
  } catch (error) {
    logger.error('[Meta API] Send media message failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get message details
 * @param {string} accessToken - Access token
 * @param {string} messageId - Instagram message ID
 * @returns {Promise<Object>} Message details
 */
const getMessageDetails = async (accessToken, messageId) => {
  try {
    const client = createMetaClient(accessToken);
    const response = await client.get(`/${messageId}`, {
      params: {
        fields: 'id,from,to,message,type,created_timestamp,subject',
      },
    });

    return response.data;
  } catch (error) {
    logger.error('[Meta API] Get message failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get conversation messages
 * @param {string} accessToken - Access token
 * @param {string} conversationId - Conversation ID
 * @param {number} limit - Number of messages to fetch
 * @param {string} after - Cursor for pagination
 * @returns {Promise<Object>} Messages and pagination
 */
const getConversationMessages = async (
  accessToken,
  conversationId,
  limit = 20,
  after = null
) => {
  try {
    const client = createMetaClient(accessToken);
    const params = {
      fields: 'id,from,to,message,type,created_timestamp,subject',
      limit,
    };

    if (after) {
      params.after = after;
    }

    const response = await client.get(`/${conversationId}/messages`, { params });

    return {
      messages: response.data.data || [],
      paging: response.data.paging || {},
    };
  } catch (error) {
    logger.error('[Meta API] Get conversation messages failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Mark message as read
 * @param {string} accessToken - Access token
 * @param {string} businessAccountId - Business account ID
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<boolean>} Success status
 */
const markConversationRead = async (accessToken, businessAccountId, conversationId) => {
  try {
    logger.info('[Meta API] Marking conversation as read', { conversationId });

    const client = createMetaClient(accessToken);
    await client.post(`/${conversationId}/messages`, {
      recipient: { id: conversationId },
      sender_action: 'mark_seen',
    });

    return true;
  } catch (error) {
    logger.error('[Meta API] Mark read failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Set typing indicator
 * @param {string} accessToken - Access token
 * @param {string} businessAccountId - Business account ID
 * @param {string} recipientId - Recipient PSID
 * @returns {Promise<boolean>} Success status
 */
const setTypingIndicator = async (accessToken, businessAccountId, recipientId) => {
  try {
    const client = createMetaClient(accessToken);
    await client.post(`/${businessAccountId}/messages`, {
      recipient: { id: recipientId },
      sender_action: 'typing_on',
    });

    return true;
  } catch (error) {
    logger.error('[Meta API] Set typing indicator failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get conversations list with filtering
 * @param {string} accessToken - Access token
 * @param {string} businessAccountId - Business account ID
 * @param {Object} options - Filtering options
 * @returns {Promise<Object>} Conversations and pagination
 */
const getConversations = async (accessToken, businessAccountId, options = {}) => {
  try {
    const {
      limit = 20,
      after = null,
      fields = 'id,senders,wallpaper,former_participants,updated_time',
    } = options;

    const client = createMetaClient(accessToken);
    const params = { fields, limit };

    if (after) {
      params.after = after;
    }

    const response = await client.get(`/${businessAccountId}/conversations`, { params });

    return {
      conversations: response.data.data || [],
      paging: response.data.paging || {},
    };
  } catch (error) {
    logger.error('[Meta API] Get conversations failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update account welcome message
 * @param {string} accessToken - Access token
 * @param {string} businessAccountId - Business account ID
 * @param {string} welcomeMessage - Welcome message text
 * @returns {Promise<boolean>} Success status
 */
const updateWelcomeMessage = async (accessToken, businessAccountId, welcomeMessage) => {
  try {
    logger.info('[Meta API] Updating welcome message', { businessAccountId });

    const client = createMetaClient(accessToken);
    await client.post(`/${businessAccountId}/message_templates`, {
      name: 'welcome_message',
      category: 'WELCOME',
      text: welcomeMessage,
    });

    return true;
  } catch (error) {
    logger.error('[Meta API] Update welcome message failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get account insights
 * @param {string} accessToken - Access token
 * @param {string} businessAccountId - Business account ID
 * @param {Array} metrics - Metrics to fetch
 * @returns {Promise<Object>} Insights data
 */
const getAccountInsights = async (
  accessToken,
  businessAccountId,
  metrics = ['impressions', 'reach', 'profile_views']
) => {
  try {
    logger.info('[Meta API] Fetching account insights', {
      businessAccountId,
      metricCount: metrics.length,
    });

    const client = createMetaClient(accessToken);
    const response = await client.get(`/${businessAccountId}/insights`, {
      params: { metric: metrics.join(',') },
    });

    return response.data.data || [];
  } catch (error) {
    logger.error('[Meta API] Get insights failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Test webhook configuration
 * @param {string} accessToken - Access token
 * @param {string} businessAccountId - Business account ID
 * @returns {Promise<Object>} Webhook test result
 */
const testWebhook = async (accessToken, businessAccountId) => {
  try {
    logger.info('[Meta API] Testing webhook', { businessAccountId });

    const client = createMetaClient(accessToken);
    const response = await client.post(`/${businessAccountId}/messages`, {
      recipient: { id: 'test_user' },
      message: { text: 'Test webhook message' },
    });

    return {
      success: true,
      messageId: response.data.message_id,
    };
  } catch (error) {
    logger.error('[Meta API] Webhook test failed:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  getBusinessAccountId,
  sendTextMessage,
  sendQuickReplyMessage,
  sendTemplateMessage,
  sendMediaMessage,
  getMessageDetails,
  getConversationMessages,
  markConversationRead,
  setTypingIndicator,
  getConversations,
  updateWelcomeMessage,
  getAccountInsights,
  testWebhook,
};
