const axios = require('axios');
const logger = require('../utils/logger');

const { config } = require('./env');

const instagramAPI = axios.create({
  baseURL: `https://graph.instagram.com/${config.instagram.apiVersion}`,
  timeout: 10000,
});

// Refresh Instagram access token
const refreshToken = async (userId, refreshToken) => {
  try {
    const response = await instagramAPI.get('/refresh_access_token', {
      params: {
        grant_type: 'ig_refresh_token',
        access_token: refreshToken,
      },
    });

    return response.data.access_token;
  } catch (error) {
    logger.error('Failed to refresh Instagram token', error);
    throw error;
  }
};

// Get Instagram user info
const getUserInfo = async (userId, accessToken) => {
  try {
    const response = await instagramAPI.get(`/${userId}`, {
      params: {
        fields: 'id,username,name,biography,profile_picture_url,followers_count,website',
        access_token: accessToken,
      },
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to fetch Instagram user info', error);
    throw error;
  }
};

// Send message via Instagram
const sendMessage = async (recipientId, message, accessToken, accountId) => {
  try {
    const response = await instagramAPI.post(`/${accountId}/messages`, {
      recipient: {
        id: recipientId,
      },
      message: {
        text: message,
      },
      access_token: accessToken,
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to send Instagram message', error);
    throw error;
  }
};

module.exports = {
  instagramAPI,
  refreshToken,
  getUserInfo,
  sendMessage,
};
