const axios = require("axios");
const logger = require("../../utils/logger");
const { config } = require("../config/env");

const GRAPH_API_VERSION = config.instagram.apiVersion || "v18.0";
const BASE_URL = `https://graph.instagram.com/${GRAPH_API_VERSION}`;

// Axios instance for Instagram Graph API
const instagramAPI = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

/**
 * Generate Instagram OAuth authorization URL
 * @param {string} state - CSRF protection state token
 * @returns {string} Authorization URL
 */
const generateAuthUrl = (state) => {
  const params = new URLSearchParams({
    client_id: config.instagram.appId,
    redirect_uri: config.instagram.redirectUri,
    scope:
      "user_profile,user_media,instagram_basic,instagram_manage_messages,instagram_manage_insights,pages_messaging,pages_show_list",
    response_type: "code",
    state: state,
  });

  return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
};

/**
 * Exchange authorization code for access token
 * @param {string} code - Authorization code from OAuth callback
 * @returns {Promise<{accessToken: string, instagramId: string}>}
 */
const exchangeCodeForToken = async (code) => {
  try {
    const response = await axios.post(
      "https://api.instagram.com/oauth/access_token",
      {
        client_id: config.instagram.appId,
        client_secret: config.instagram.appSecret,
        grant_type: "authorization_code",
        redirect_uri: config.instagram.redirectUri,
        code: code,
      },
    );

    const { access_token, user_id } = response.data;

    logger.info("[OAuth] Code exchanged for token", {
      userId: user_id,
      tokenSnippet: `${access_token.substring(0, 10)}...`,
    });

    return {
      accessToken: access_token,
      instagramId: user_id,
    };
  } catch (error) {
    logger.error(
      "[OAuth] Failed to exchange code for token",
      error.response?.data || error.message,
    );
    throw new Error("Failed to exchange authorization code for access token");
  }
};

/**
 * Get Instagram Business Account information
 * @param {string} accessToken - Access token
 * @param {string} instagramId - Instagram user ID
 * @returns {Promise<Object>} Account information
 */
const getBusinessAccountInfo = async (accessToken, instagramId) => {
  try {
    const response = await instagramAPI.get(`/${instagramId}`, {
      params: {
        fields:
          "id,username,name,profile_picture_url,biography,followers_count,website,ig_id",
        access_token: accessToken,
      },
    });

    logger.info("[OAuth] Retrieved business account info", {
      instagramId,
      username: response.data.username,
    });

    return response.data;
  } catch (error) {
    logger.error(
      "[OAuth] Failed to get business account info",
      error.response?.data || error.message,
    );
    throw new Error(
      "Failed to retrieve Instagram business account information",
    );
  }
};

/**
 * Subscribe to Instagram webhooks
 * @param {string} accessToken - Access token
 * @param {string} instagramId - Instagram business account ID
 * @returns {Promise<Object>} Subscription result
 */
const subscribeToWebhook = async (accessToken, instagramId) => {
  try {
    const response = await instagramAPI.post(
      `/${instagramId}/subscribed_apps`,
      {
        access_token: accessToken,
        subscribed_fields:
          "messages,messaging_postbacks,messaging_optins,message_deliveries,message_reads",
      },
    );

    logger.info("[OAuth] Webhook subscription successful", { instagramId });

    return response.data;
  } catch (error) {
    logger.error(
      "[OAuth] Failed to subscribe to webhooks",
      error.response?.data || error.message,
    );
    throw new Error("Failed to subscribe to Instagram webhooks");
  }
};

/**
 * Send Instagram message
 * @param {Object} account - Instagram account object
 * @param {string} recipientId - Recipient Instagram ID
 * @param {string} message - Message text
 * @returns {Promise<Object>} Send result
 */
const sendInstagramMessage = async (account, recipientId, message) => {
  try {
    const response = await instagramAPI.post("/me/messages", {
      recipient: { id: recipientId },
      message: { text: message },
      access_token: account.accessToken,
    });

    logger.info("[Message] Sent Instagram message", {
      accountId: account._id,
      recipientId,
      messageId: response.data.message_id,
    });

    return response.data;
  } catch (error) {
    logger.error(
      "[Message] Failed to send Instagram message",
      error.response?.data || error.message,
    );
    throw new Error("Failed to send Instagram message");
  }
};

/**
 * Get Instagram conversations
 * @param {Object} account - Instagram account object
 * @returns {Promise<Array>} Conversations list
 */
const getConversations = async (account) => {
  try {
    const response = await instagramAPI.get("/me/conversations", {
      params: {
        access_token: account.accessToken,
        fields:
          "id,senders,participants,wallpaper,former_participants,updated_time",
        limit: 50,
      },
    });

    logger.info("[Conversations] Retrieved conversations", {
      accountId: account._id,
      count: response.data.data?.length || 0,
    });

    return response.data.data || [];
  } catch (error) {
    logger.error(
      "[Conversations] Failed to get conversations",
      error.response?.data || error.message,
    );
    throw new Error("Failed to retrieve Instagram conversations");
  }
};

module.exports = {
  generateAuthUrl,
  exchangeCodeForToken,
  getBusinessAccountInfo,
  subscribeToWebhook,
  sendInstagramMessage,
  getConversations,
};
