const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');
const ScheduledPost = require('../models/ScheduledPost');
const InstagramAccount = require('../models/InstagramAccount');
const User = require('../models/User');
const { publishInstagramPost, suggestHashtags, searchLocations } = require('../services/instagramPublish');
const logger = require('../../utils/logger');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/posts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `post-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only images and videos allowed.'));
  },
});

/**
 * POST /api/posts/upload
 * Upload media file(s) for post
 */
router.post('/upload', authenticate, upload.single('media'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    // For now, return local file path
    const mediaUrl = `/uploads/posts/${req.file.filename}`;
    const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

    res.json({
      success: true,
      mediaUrl,
      mediaType,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (error) {
    logger.error('[Posts] Upload error', error);
    next(error);
  }
});

/**
 * POST /api/posts/upload-multiple
 * Upload multiple files for carousel post
 */
router.post('/upload-multiple', authenticate, upload.array('media', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const mediaFiles = req.files.map((file, index) => ({
      url: `/uploads/posts/${file.filename}`,
      type: file.mimetype.startsWith('video/') ? 'video' : 'image',
      filename: file.filename,
      size: file.size,
      order: index,
    }));

    res.json({
      success: true,
      mediaFiles,
      count: mediaFiles.length,
    });
  } catch (error) {
    logger.error('[Posts] Multiple upload error', error);
    next(error);
  }
});

/**
 * POST /api/posts
 * Create new post (draft or scheduled)
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      instagramAccountId,
      mediaUrl,
      mediaType,
      mediaFiles,
      caption,
      hashtags,
      location,
      altText,
      firstComment,
      scheduledFor,
      timezone,
      publishNow,
    } = req.body;

    // Validate account ownership
    const account = await InstagramAccount.findOne({
      _id: instagramAccountId,
      userId,
      isActive: true,
    });

    if (!account) {
      return res.status(404).json({ error: 'Instagram account not found' });
    }

    // Validate media
    if (!mediaUrl && (!mediaFiles || mediaFiles.length === 0)) {
      return res.status(400).json({ error: 'Media URL or files required' });
    }

    // Create post document
    const postData = {
      userId,
      instagramAccountId,
      mediaUrl,
      mediaType: mediaType || 'image',
      caption: caption || '',
      hashtags: hashtags || [],
      location,
      altText,
      firstComment,
      timezone: timezone || 'UTC',
    };

    if (mediaFiles && mediaFiles.length > 0) {
      postData.mediaFiles = mediaFiles;
      postData.mediaType = 'carousel';
    }

    // Determine status
    if (publishNow) {
      postData.status = 'scheduled';
      postData.scheduledFor = new Date(); // Publish immediately
    } else if (scheduledFor) {
      postData.status = 'scheduled';
      postData.scheduledFor = new Date(scheduledFor);
    } else {
      postData.status = 'draft';
    }

    const post = await ScheduledPost.create(postData);

    logger.info('[Posts] Post created', {
      postId: post._id,
      status: post.status,
      userId,
    });

    res.status(201).json({
      success: true,
      post,
    });
  } catch (error) {
    logger.error('[Posts] Create error', error);
    next(error);
  }
});

/**
 * GET /api/posts
 * List all posts for user
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, instagramAccountId, limit = 50, skip = 0 } = req.query;

    const query = { userId };

    if (status) {
      query.status = status;
    }

    if (instagramAccountId) {
      query.instagramAccountId = instagramAccountId;
    }

    const posts = await ScheduledPost.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('instagramAccountId', 'username profilePictureUrl');

    const total = await ScheduledPost.countDocuments(query);

    res.json({
      success: true,
      posts,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
  } catch (error) {
    logger.error('[Posts] List error', error);
    next(error);
  }
});

/**
 * GET /api/posts/:id
 * Get single post details
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const post = await ScheduledPost.findOne({
      _id: id,
      userId,
    }).populate('instagramAccountId', 'username profilePictureUrl instagramId');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({
      success: true,
      post,
    });
  } catch (error) {
    logger.error('[Posts] Get error', error);
    next(error);
  }
});

/**
 * PUT /api/posts/:id
 * Update post (only drafts and scheduled)
 */
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    const post = await ScheduledPost.findOne({
      _id: id,
      userId,
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Can only update drafts and scheduled posts
    if (!['draft', 'scheduled'].includes(post.status)) {
      return res.status(400).json({
        error: 'Cannot update published or publishing posts',
      });
    }

    // Update allowed fields
    const allowedFields = [
      'caption',
      'hashtags',
      'location',
      'altText',
      'firstComment',
      'scheduledFor',
      'timezone',
      'mediaUrl',
      'mediaFiles',
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        post[field] = updates[field];
      }
    }

    await post.save();

    logger.info('[Posts] Post updated', { postId: post._id });

    res.json({
      success: true,
      post,
    });
  } catch (error) {
    logger.error('[Posts] Update error', error);
    next(error);
  }
});

/**
 * DELETE /api/posts/:id
 * Delete post (only drafts and failed)
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const post = await ScheduledPost.findOne({
      _id: id,
      userId,
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Can only delete drafts, failed, or scheduled posts
    if (post.status === 'published') {
      return res.status(400).json({
        error: 'Cannot delete published posts',
      });
    }

    await post.deleteOne();

    logger.info('[Posts] Post deleted', { postId: post._id });

    res.json({
      success: true,
      message: 'Post deleted',
    });
  } catch (error) {
    logger.error('[Posts] Delete error', error);
    next(error);
  }
});

/**
 * POST /api/posts/:id/publish
 * Publish post immediately
 */
router.post('/:id/publish', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const post = await ScheduledPost.findOne({
      _id: id,
      userId,
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Can only publish drafts and scheduled posts
    if (!['draft', 'scheduled', 'failed'].includes(post.status)) {
      return res.status(400).json({
        error: `Cannot publish post with status: ${post.status}`,
      });
    }

    // Get Instagram account
    const account = await InstagramAccount.findById(post.instagramAccountId).select('+accessToken');

    if (!account || !account.isActive) {
      return res.status(404).json({ error: 'Instagram account not found or inactive' });
    }

    // Mark as publishing
    await post.markAsPublishing();

    try {
      // Publish to Instagram
      const result = await publishInstagramPost(account, {
        mediaUrl: post.mediaUrl,
        mediaType: post.mediaType,
        mediaFiles: post.mediaFiles,
        caption: post.fullCaption,
        location: post.location,
      });

      // Mark as published
      await post.markAsPublished(result);

      // Add first comment if specified
      if (post.firstComment && result.id) {
        // TODO: Implement comment posting
      }

      logger.info('[Posts] Post published successfully', {
        postId: post._id,
        instagramPostId: result.id,
      });

      res.json({
        success: true,
        post,
        instagram: result,
      });
    } catch (publishError) {
      // Mark as failed
      await post.markAsFailed(publishError.message);
      throw publishError;
    }
  } catch (error) {
    logger.error('[Posts] Publish error', error);
    next(error);
  }
});

/**
 * POST /api/posts/:id/schedule
 * Schedule or reschedule post
 */
router.post('/:id/schedule', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { scheduledFor, timezone } = req.body;

    if (!scheduledFor) {
      return res.status(400).json({ error: 'scheduledFor is required' });
    }

    const post = await ScheduledPost.findOne({
      _id: id,
      userId,
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (!['draft', 'scheduled', 'failed'].includes(post.status)) {
      return res.status(400).json({
        error: 'Can only schedule drafts, scheduled, or failed posts',
      });
    }

    post.scheduledFor = new Date(scheduledFor);
    if (timezone) {
      post.timezone = timezone;
    }
    post.status = 'scheduled';
    await post.save();

    logger.info('[Posts] Post scheduled', {
      postId: post._id,
      scheduledFor: post.scheduledFor,
    });

    res.json({
      success: true,
      post,
    });
  } catch (error) {
    logger.error('[Posts] Schedule error', error);
    next(error);
  }
});

/**
 * POST /api/posts/:id/cancel
 * Cancel scheduled post (revert to draft)
 */
router.post('/:id/cancel', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const post = await ScheduledPost.findOne({
      _id: id,
      userId,
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.status !== 'scheduled') {
      return res.status(400).json({
        error: 'Can only cancel scheduled posts',
      });
    }

    post.status = 'draft';
    post.scheduledFor = null;
    await post.save();

    logger.info('[Posts] Post cancelled', { postId: post._id });

    res.json({
      success: true,
      post,
    });
  } catch (error) {
    logger.error('[Posts] Cancel error', error);
    next(error);
  }
});

/**
 * GET /api/posts/hashtags/suggest
 * Get hashtag suggestions based on caption
 */
router.get('/hashtags/suggest', authenticate, async (req, res, next) => {
  try {
    const { caption } = req.query;

    if (!caption) {
      return res.json({ suggestions: [] });
    }

    const suggestions = suggestHashtags(caption);

    res.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    logger.error('[Posts] Hashtag suggest error', error);
    next(error);
  }
});

/**
 * GET /api/posts/locations/search
 * Search for Instagram locations
 */
router.get('/locations/search', authenticate, async (req, res, next) => {
  try {
    const { query, latitude, longitude, instagramAccountId } = req.query;
    const userId = req.user.id;

    if (!query && (!latitude || !longitude)) {
      return res.status(400).json({
        error: 'Query or coordinates required',
      });
    }

    // Get account for access token
    const account = await InstagramAccount.findOne({
      _id: instagramAccountId,
      userId,
      isActive: true,
    }).select('+accessToken');

    if (!account) {
      return res.status(404).json({ error: 'Instagram account not found' });
    }

    const locations = await searchLocations(
      account.accessToken,
      query,
      latitude,
      longitude
    );

    res.json({
      success: true,
      locations,
    });
  } catch (error) {
    logger.error('[Posts] Location search error', error);
    next(error);
  }
});

module.exports = router;
