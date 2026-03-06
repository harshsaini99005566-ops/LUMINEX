const axios = require('axios');
const logger = require('../../utils/logger');
const { config } = require('../config/env');

const GRAPH_API_VERSION = config.instagram.apiVersion || 'v18.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Instagram Content Publishing Service
 * Handles creating and publishing Instagram posts
 */

/**
 * Step 1: Create media container
 * Uploads media to Instagram and gets a creation ID
 */
const createMediaContainer = async (accessToken, instagramAccountId, postData) => {
  try {
    const { mediaUrl, mediaType, caption, location } = postData;

    const params = {
      access_token: accessToken,
    };

    // Add media URL based on type
    if (mediaType === 'image') {
      params.image_url = mediaUrl;
    } else if (mediaType === 'video') {
      params.video_url = mediaUrl;
      params.media_type = 'VIDEO';
    }

    // Add caption if provided
    if (caption) {
      params.caption = caption;
    }

    // Add location if provided
    if (location && location.id) {
      params.location_id = location.id;
    }

    const response = await axios.post(
      `${GRAPH_API_BASE}/${instagramAccountId}/media`,
      null,
      { params }
    );

    logger.info('[Instagram Publish] Media container created', {
      creationId: response.data.id,
      instagramAccountId,
    });

    return {
      creationId: response.data.id,
    };
  } catch (error) {
    logger.error('[Instagram Publish] Failed to create media container', {
      error: error.response?.data || error.message,
      instagramAccountId,
    });
    throw new Error(
      `Failed to create media container: ${error.response?.data?.error?.message || error.message}`
    );
  }
};

/**
 * Step 2: Publish media container
 * Makes the media live on Instagram
 */
const publishMediaContainer = async (accessToken, instagramAccountId, creationId) => {
  try {
    const response = await axios.post(
      `${GRAPH_API_BASE}/${instagramAccountId}/media_publish`,
      null,
      {
        params: {
          creation_id: creationId,
          access_token: accessToken,
        },
      }
    );

    logger.info('[Instagram Publish] Media published successfully', {
      postId: response.data.id,
      instagramAccountId,
    });

    return {
      id: response.data.id,
    };
  } catch (error) {
    logger.error('[Instagram Publish] Failed to publish media', {
      error: error.response?.data || error.message,
      creationId,
      instagramAccountId,
    });
    throw new Error(
      `Failed to publish media: ${error.response?.data?.error?.message || error.message}`
    );
  }
};

/**
 * Get published media details (permalink, etc.)
 */
const getMediaDetails = async (accessToken, mediaId) => {
  try {
    const response = await axios.get(`${GRAPH_API_BASE}/${mediaId}`, {
      params: {
        fields: 'id,permalink,media_type,media_url,timestamp',
        access_token: accessToken,
      },
    });

    return response.data;
  } catch (error) {
    logger.error('[Instagram Publish] Failed to get media details', {
      error: error.response?.data || error.message,
      mediaId,
    });
    // Don't throw - this is not critical
    return null;
  }
};

/**
 * Create carousel (album) post
 */
const createCarouselContainer = async (accessToken, instagramAccountId, postData) => {
  try {
    const { mediaFiles, caption, location } = postData;

    // Step 1: Create containers for each media item
    const itemContainers = [];
    for (const mediaFile of mediaFiles) {
      const params = {
        access_token: accessToken,
        is_carousel_item: true,
      };

      if (mediaFile.type === 'image') {
        params.image_url = mediaFile.url;
      } else if (mediaFile.type === 'video') {
        params.video_url = mediaFile.url;
        params.media_type = 'VIDEO';
      }

      const response = await axios.post(
        `${GRAPH_API_BASE}/${instagramAccountId}/media`,
        null,
        { params }
      );

      itemContainers.push(response.data.id);
    }

    // Step 2: Create carousel container with all items
    const carouselParams = {
      media_type: 'CAROUSEL',
      children: itemContainers.join(','),
      access_token: accessToken,
    };

    if (caption) {
      carouselParams.caption = caption;
    }

    if (location && location.id) {
      carouselParams.location_id = location.id;
    }

    const carouselResponse = await axios.post(
      `${GRAPH_API_BASE}/${instagramAccountId}/media`,
      null,
      { params: carouselParams }
    );

    logger.info('[Instagram Publish] Carousel container created', {
      creationId: carouselResponse.data.id,
      itemCount: itemContainers.length,
    });

    return {
      creationId: carouselResponse.data.id,
    };
  } catch (error) {
    logger.error('[Instagram Publish] Failed to create carousel', {
      error: error.response?.data || error.message,
    });
    throw new Error(
      `Failed to create carousel: ${error.response?.data?.error?.message || error.message}`
    );
  }
};

/**
 * Main publish function - handles full publishing flow
 */
const publishInstagramPost = async (account, postData) => {
  try {
    const { accessToken, instagramId } = account;

    logger.info('[Instagram Publish] Starting publish process', {
      accountId: account._id,
      mediaType: postData.mediaType,
    });

    // Step 1: Create media container
    let creationId;
    if (postData.mediaType === 'carousel' && postData.mediaFiles) {
      const result = await createCarouselContainer(accessToken, instagramId, postData);
      creationId = result.creationId;
    } else {
      const result = await createMediaContainer(accessToken, instagramId, postData);
      creationId = result.creationId;
    }

    // Step 2: Publish the media
    const publishResult = await publishMediaContainer(accessToken, instagramId, creationId);

    // Step 3: Get media details (optional, for permalink)
    const mediaDetails = await getMediaDetails(accessToken, publishResult.id);

    return {
      id: publishResult.id,
      creationId,
      permalink: mediaDetails?.permalink,
      timestamp: mediaDetails?.timestamp,
    };
  } catch (error) {
    logger.error('[Instagram Publish] Publish failed', {
      error: error.message,
      accountId: account._id,
    });
    throw error;
  }
};

/**
 * Check media container status (for videos)
 * Videos take time to process, need to check if ready
 */
const checkContainerStatus = async (accessToken, creationId) => {
  try {
    const response = await axios.get(`${GRAPH_API_BASE}/${creationId}`, {
      params: {
        fields: 'status_code,status',
        access_token: accessToken,
      },
    });

    // Status codes:
    // EXPIRED = Container expired
    // ERROR = Error occurred
    // FINISHED = Ready to publish
    // IN_PROGRESS = Still processing
    // PUBLISHED = Already published

    return {
      statusCode: response.data.status_code,
      status: response.data.status,
      isReady: response.data.status_code === 'FINISHED',
      isError: response.data.status_code === 'ERROR',
    };
  } catch (error) {
    logger.error('[Instagram Publish] Failed to check container status', {
      error: error.response?.data || error.message,
      creationId,
    });
    throw error;
  }
};

/**
 * Search for Instagram locations
 */
const searchLocations = async (accessToken, query, latitude, longitude) => {
  try {
    const params = {
      access_token: accessToken,
    };

    if (query) {
      params.q = query;
    }

    if (latitude && longitude) {
      params.latitude = latitude;
      params.longitude = longitude;
      params.distance = 5000; // 5km radius
    }

    const response = await axios.get(
      `${GRAPH_API_BASE}/ig_search`,
      { params }
    );

    return response.data.data || [];
  } catch (error) {
    logger.error('[Instagram Publish] Location search failed', {
      error: error.response?.data || error.message,
    });
    return [];
  }
};

/**
 * Get hashtag suggestions based on caption
 */
const suggestHashtags = (caption) => {
  // Simple hashtag extraction and suggestions
  const words = caption.toLowerCase().split(/\s+/);
  const suggestions = [];

  // Extract existing hashtags
  const existingHashtags = caption.match(/#\w+/g) || [];
  
  // Popular Instagram hashtags (you can enhance this with AI or API)
  const popularTags = [
    '#instagood', '#photooftheday', '#love', '#instagram', '#follow',
    '#like', '#fashion', '#beautiful', '#happy', '#art', '#photography',
    '#picoftheday', '#style', '#instadaily', '#followme', '#travel',
    '#nature', '#beauty', '#photo', '#life', '#fun', '#smile'
  ];

  // Add some popular tags if not already present
  const existingSet = new Set(existingHashtags.map(tag => tag.toLowerCase()));
  for (const tag of popularTags) {
    if (!existingSet.has(tag.toLowerCase()) && suggestions.length < 10) {
      suggestions.push(tag);
    }
  }

  return suggestions;
};

module.exports = {
  publishInstagramPost,
  createMediaContainer,
  publishMediaContainer,
  createCarouselContainer,
  getMediaDetails,
  checkContainerStatus,
  searchLocations,
  suggestHashtags,
};
