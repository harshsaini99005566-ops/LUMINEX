const mongoose = require('mongoose');

/**
 * ScheduledPost Model
 * Stores Instagram posts (drafts, scheduled, and published)
 */
const scheduledPostSchema = new mongoose.Schema({
  // Owner information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  instagramAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstagramAccount',
    required: true,
    index: true,
  },

  // Media information
  mediaUrl: {
    type: String,
    required: true,
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', 'carousel'],
    required: true,
  },
  mediaFiles: [{
    url: String,
    type: String, // 'image' or 'video'
    order: Number,
  }], // For carousel posts

  // Post content
  caption: {
    type: String,
    maxlength: 2200,
    default: '',
  },
  hashtags: [{
    type: String,
    trim: true,
  }],
  location: {
    id: String,
    name: String,
  },
  altText: {
    type: String,
    maxlength: 100,
  },
  firstComment: {
    type: String,
    maxlength: 2200,
  },

  // Scheduling
  scheduledFor: {
    type: Date,
    index: true,
  },
  timezone: {
    type: String,
    default: 'UTC',
  },

  // Status tracking
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'publishing', 'published', 'failed'],
    default: 'draft',
    index: true,
  },
  publishedAt: Date,
  failedAt: Date,
  errorMessage: String,

  // Instagram response
  instagramPostId: String, // Instagram's media ID after publishing
  instagramPermalink: String, // Public URL to the post
  creationId: String, // Temporary ID during Instagram's two-step publish

  // Metadata
  attempts: {
    type: Number,
    default: 0,
  },
  lastAttemptAt: Date,
}, {
  timestamps: true,
});

// Indexes for efficient queries
scheduledPostSchema.index({ status: 1, scheduledFor: 1 });
scheduledPostSchema.index({ userId: 1, status: 1, createdAt: -1 });
scheduledPostSchema.index({ instagramAccountId: 1, status: 1 });

// Virtual for full caption (with hashtags)
scheduledPostSchema.virtual('fullCaption').get(function() {
  const caption = this.caption || '';
  const hashtags = this.hashtags && this.hashtags.length > 0 
    ? '\n\n' + this.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')
    : '';
  return caption + hashtags;
});

// Method to check if post is ready to publish
scheduledPostSchema.methods.isReadyToPublish = function() {
  if (this.status !== 'scheduled') return false;
  if (!this.scheduledFor) return false;
  return new Date() >= this.scheduledFor;
};

// Method to mark as publishing
scheduledPostSchema.methods.markAsPublishing = function() {
  this.status = 'publishing';
  this.lastAttemptAt = new Date();
  this.attempts += 1;
  return this.save();
};

// Method to mark as published
scheduledPostSchema.methods.markAsPublished = function(instagramData) {
  this.status = 'published';
  this.publishedAt = new Date();
  this.instagramPostId = instagramData.id;
  this.instagramPermalink = instagramData.permalink;
  return this.save();
};

// Method to mark as failed
scheduledPostSchema.methods.markAsFailed = function(errorMessage) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.errorMessage = errorMessage;
  return this.save();
};

// Static method to get posts ready for publishing
scheduledPostSchema.statics.getReadyToPublish = function() {
  return this.find({
    status: 'scheduled',
    scheduledFor: { $lte: new Date() },
  }).sort({ scheduledFor: 1 });
};

// Static method to retry failed posts
scheduledPostSchema.statics.getRetryable = function() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return this.find({
    status: 'failed',
    attempts: { $lt: 3 }, // Max 3 retry attempts
    lastAttemptAt: { $lt: oneHourAgo }, // Wait 1 hour between retries
  });
};

module.exports = mongoose.model('ScheduledPost', scheduledPostSchema);
