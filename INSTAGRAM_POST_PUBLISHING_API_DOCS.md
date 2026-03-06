# Instagram Post Publishing API Documentation

## Base URL
```
http://localhost:5000/api/posts
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Endpoints

### 1. Upload Single Media File

**Endpoint:** `POST /api/posts/upload`

**Description:** Upload a single image or video file for posting to Instagram.

**Content-Type:** `multipart/form-data`

**Request Body:**
```javascript
FormData {
  media: File // Image (JPG, PNG, GIF) or Video (MP4, MOV, AVI), max 100MB
}
```

**Success Response (200):**
```json
{
  "url": "/uploads/posts/1703001234567-photo.jpg",
  "type": "image",
  "filename": "photo.jpg",
  "size": 1024567
}
```

**Error Responses:**
- `400` - No file uploaded
- `400` - Invalid file type
- `413` - File too large (max 100MB)

**Example:**
```javascript
const formData = new FormData();
formData.append('media', fileInput.files[0]);

const response = await fetch('/api/posts/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const { url, type } = await response.json();
```

---

### 2. Upload Multiple Media Files (Carousel)

**Endpoint:** `POST /api/posts/upload-multiple`

**Description:** Upload 2-10 images for a carousel post.

**Content-Type:** `multipart/form-data`

**Request Body:**
```javascript
FormData {
  media: File[], // 2-10 images (JPG, PNG, GIF), max 100MB each
}
```

**Success Response (200):**
```json
[
  {
    "url": "/uploads/posts/1703001234567-photo1.jpg",
    "type": "image",
    "filename": "photo1.jpg",
    "size": 1024567
  },
  {
    "url": "/uploads/posts/1703001234568-photo2.jpg",
    "type": "image",
    "filename": "photo2.jpg",
    "size": 987654
  }
]
```

**Error Responses:**
- `400` - No files uploaded
- `400` - Invalid file type (only images allowed for carousel)
- `400` - More than 10 files uploaded
- `413` - File too large

**Example:**
```javascript
const formData = new FormData();
Array.from(fileInput.files).forEach(file => {
  formData.append('media', file);
});

const response = await fetch('/api/posts/upload-multiple', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const mediaFiles = await response.json();
```

---

### 3. Create Post

**Endpoint:** `POST /api/posts`

**Description:** Create a new post (draft or scheduled). Media must be uploaded first using upload endpoints.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "instagramAccountId": "507f1f77bcf86cd799439011",
  "mediaUrl": "/uploads/posts/1703001234567-photo.jpg",  // For single media
  "mediaType": "image",  // "image", "video", or "carousel"
  "mediaUrls": [  // For carousel (2-10 images)
    "/uploads/posts/1703001234567-photo1.jpg",
    "/uploads/posts/1703001234568-photo2.jpg"
  ],
  "caption": "Amazing sunset! 🌅",
  "hashtags": ["sunset", "nature", "photography"],
  "location": {
    "id": "213385402",
    "name": "Golden Gate Bridge",
    "latitude": 37.8199,
    "longitude": -122.4783
  },
  "scheduledFor": "2024-01-15T18:00:00.000Z",  // Optional, for scheduled posts
  "publishNow": false  // If true, publishes immediately
}
```

**Success Response (201):**
```json
{
  "post": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "instagramAccountId": "507f1f77bcf86cd799439011",
    "mediaUrl": "/uploads/posts/1703001234567-photo.jpg",
    "mediaType": "image",
    "caption": "Amazing sunset! 🌅",
    "hashtags": ["sunset", "nature", "photography"],
    "location": {
      "id": "213385402",
      "name": "Golden Gate Bridge",
      "latitude": 37.8199,
      "longitude": -122.4783
    },
    "status": "draft",  // or "scheduled" if scheduledFor provided
    "scheduledFor": null,
    "attempts": 0,
    "createdAt": "2024-01-10T12:00:00.000Z",
    "updatedAt": "2024-01-10T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `400` - Invalid media type
- `400` - Instagram account not found
- `403` - Not authorized to use this account
- `500` - Failed to create post

**Example:**
```javascript
const postData = {
  instagramAccountId: selectedAccountId,
  mediaUrl: uploadedFile.url,
  mediaType: uploadedFile.type,
  caption: "Hello Instagram!",
  hashtags: ["test", "automation"],
  publishNow: false
};

const response = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(postData)
});

const { post } = await response.json();
```

---

### 4. List Posts

**Endpoint:** `GET /api/posts`

**Description:** Get all posts for the authenticated user with optional filters.

**Query Parameters:**
```
status       - Filter by status: draft, scheduled, publishing, published, failed
instagramAccountId - Filter by Instagram account ID
page         - Page number (default: 1)
limit        - Results per page (default: 20, max: 100)
```

**Success Response (200):**
```json
{
  "posts": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f191e810c19729de860ea",
      "instagramAccountId": "507f1f77bcf86cd799439011",
      "mediaUrl": "/uploads/posts/1703001234567-photo.jpg",
      "mediaType": "image",
      "caption": "Amazing sunset! 🌅",
      "hashtags": ["sunset", "nature"],
      "status": "published",
      "instagramPostId": "18012345678901234",
      "permalink": "https://www.instagram.com/p/ABC123/",
      "publishedAt": "2024-01-10T18:00:00.000Z",
      "createdAt": "2024-01-10T12:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "pages": 3
}
```

**Example:**
```javascript
// Get all posts
const response = await fetch('/api/posts', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Get only scheduled posts
const response = await fetch('/api/posts?status=scheduled', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Get posts for specific account, page 2
const response = await fetch(
  '/api/posts?instagramAccountId=507f1f77bcf86cd799439011&page=2&limit=10',
  { headers: { 'Authorization': `Bearer ${token}` } }
);

const { posts, total, page, pages } = await response.json();
```

---

### 5. Get Single Post

**Endpoint:** `GET /api/posts/:id`

**Description:** Get details of a specific post by ID.

**URL Parameters:**
```
id - Post ID (MongoDB ObjectId)
```

**Success Response (200):**
```json
{
  "post": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "instagramAccountId": "507f1f77bcf86cd799439011",
    "mediaUrl": "/uploads/posts/1703001234567-photo.jpg",
    "mediaType": "image",
    "caption": "Amazing sunset! 🌅",
    "hashtags": ["sunset", "nature", "photography"],
    "location": {
      "id": "213385402",
      "name": "Golden Gate Bridge"
    },
    "status": "published",
    "instagramPostId": "18012345678901234",
    "permalink": "https://www.instagram.com/p/ABC123/",
    "publishedAt": "2024-01-10T18:00:00.000Z",
    "createdAt": "2024-01-10T12:00:00.000Z",
    "updatedAt": "2024-01-10T18:00:05.000Z"
  }
}
```

**Error Responses:**
- `404` - Post not found
- `403` - Not authorized

**Example:**
```javascript
const response = await fetch(`/api/posts/${postId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { post } = await response.json();
```

---

### 6. Update Post

**Endpoint:** `PUT /api/posts/:id`

**Description:** Update a draft or scheduled post. Cannot update published posts.

**URL Parameters:**
```
id - Post ID
```

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "caption": "Updated caption! ✨",
  "hashtags": ["updated", "hashtags"],
  "location": {
    "id": "213385402",
    "name": "New Location"
  }
}
```

**Success Response (200):**
```json
{
  "post": {
    "_id": "507f1f77bcf86cd799439011",
    "caption": "Updated caption! ✨",
    "hashtags": ["updated", "hashtags"],
    "location": {
      "id": "213385402",
      "name": "New Location"
    },
    "updatedAt": "2024-01-10T13:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Cannot update published posts
- `404` - Post not found
- `403` - Not authorized

**Example:**
```javascript
const updates = {
  caption: "New caption",
  hashtags: ["new", "tags"]
};

const response = await fetch(`/api/posts/${postId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(updates)
});

const { post } = await response.json();
```

---

### 7. Delete Post

**Endpoint:** `DELETE /api/posts/:id`

**Description:** Delete a post. Cannot delete published posts.

**URL Parameters:**
```
id - Post ID
```

**Success Response (200):**
```json
{
  "message": "Post deleted successfully"
}
```

**Error Responses:**
- `400` - Cannot delete published posts
- `404` - Post not found
- `403` - Not authorized

**Example:**
```javascript
const response = await fetch(`/api/posts/${postId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});

const { message } = await response.json();
```

---

### 8. Publish Post Immediately

**Endpoint:** `POST /api/posts/:id/publish`

**Description:** Publish a draft or scheduled post to Instagram immediately.

**URL Parameters:**
```
id - Post ID
```

**Success Response (200):**
```json
{
  "message": "Post published successfully to Instagram",
  "post": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "published",
    "instagramPostId": "18012345678901234",
    "permalink": "https://www.instagram.com/p/ABC123/",
    "publishedAt": "2024-01-10T18:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Post already published
- `400` - No media uploaded
- `404` - Post not found
- `404` - Instagram account not found
- `400` - Instagram token expired
- `500` - Failed to publish to Instagram

**Example:**
```javascript
const response = await fetch(`/api/posts/${postId}/publish`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});

const { message, post } = await response.json();

// For videos, post.status may be "publishing" - wait and check again
if (post.status === 'publishing') {
  // Poll every 10 seconds
  const checkStatus = setInterval(async () => {
    const statusResponse = await fetch(`/api/posts/${postId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const { post: updatedPost } = await statusResponse.json();
    
    if (updatedPost.status === 'published') {
      clearInterval(checkStatus);
      console.log('Video published!', updatedPost.permalink);
    } else if (updatedPost.status === 'failed') {
      clearInterval(checkStatus);
      console.error('Publishing failed:', updatedPost.errorMessage);
    }
  }, 10000);
}
```

---

### 9. Schedule Post

**Endpoint:** `POST /api/posts/:id/schedule`

**Description:** Schedule a post for future publishing or reschedule an existing scheduled post.

**URL Parameters:**
```
id - Post ID
```

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "scheduledFor": "2024-01-15T18:00:00.000Z"
}
```

**Success Response (200):**
```json
{
  "message": "Post scheduled successfully",
  "post": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "scheduled",
    "scheduledFor": "2024-01-15T18:00:00.000Z",
    "updatedAt": "2024-01-10T13:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Scheduled time must be in the future
- `400` - Cannot schedule published posts
- `404` - Post not found

**Example:**
```javascript
const scheduleData = {
  scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
};

const response = await fetch(`/api/posts/${postId}/schedule`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(scheduleData)
});

const { message, post } = await response.json();
```

---

### 10. Cancel Scheduled Post

**Endpoint:** `POST /api/posts/:id/cancel`

**Description:** Cancel a scheduled post and revert to draft status.

**URL Parameters:**
```
id - Post ID
```

**Success Response (200):**
```json
{
  "message": "Scheduled post cancelled",
  "post": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "draft",
    "scheduledFor": null,
    "updatedAt": "2024-01-10T13:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Post is not scheduled
- `404` - Post not found

**Example:**
```javascript
const response = await fetch(`/api/posts/${postId}/cancel`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});

const { message, post } = await response.json();
```

---

### 11. Get Hashtag Suggestions

**Endpoint:** `GET /api/posts/hashtags/suggest`

**Description:** Get AI-powered hashtag suggestions based on keywords.

**Query Parameters:**
```
keywords - Comma-separated keywords (e.g., "sunset,beach,travel")
```

**Success Response (200):**
```json
{
  "hashtags": [
    {
      "tag": "sunset",
      "popularity": "high",
      "category": "nature"
    },
    {
      "tag": "sunsetlovers",
      "popularity": "high",
      "category": "community"
    },
    {
      "tag": "beach",
      "popularity": "high",
      "category": "location"
    }
  ]
}
```

**Example:**
```javascript
const response = await fetch(
  '/api/posts/hashtags/suggest?keywords=sunset,beach,travel',
  { headers: { 'Authorization': `Bearer ${token}` } }
);

const { hashtags } = await response.json();

// Display suggestions
hashtags.forEach(({ tag, popularity }) => {
  console.log(`#${tag} - ${popularity} popularity`);
});
```

---

### 12. Search Locations

**Endpoint:** `GET /api/posts/locations/search`

**Description:** Search for Instagram locations by name and optionally by coordinates.

**Query Parameters:**
```
query     - Location name to search for
latitude  - Optional latitude for geo-based search
longitude - Optional longitude for geo-based search
```

**Success Response (200):**
```json
{
  "locations": [
    {
      "id": "213385402",
      "name": "Golden Gate Bridge",
      "latitude": 37.8199,
      "longitude": -122.4783,
      "address": "San Francisco, CA"
    }
  ]
}
```

**Example:**
```javascript
// Search by name only
const response = await fetch(
  '/api/posts/locations/search?query=Golden+Gate+Bridge',
  { headers: { 'Authorization': `Bearer ${token}` } }
);

// Search with coordinates (more accurate)
const response = await fetch(
  '/api/posts/locations/search?query=cafe&latitude=37.7749&longitude=-122.4194',
  { headers: { 'Authorization': `Bearer ${token}` } }
);

const { locations } = await response.json();
```

---

## Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request - validation error |
| 401 | Unauthorized - missing or invalid token |
| 403 | Forbidden - not authorized for this resource |
| 404 | Not found - resource doesn't exist |
| 413 | Payload too large - file exceeds size limit |
| 429 | Too many requests - rate limit exceeded |
| 500 | Server error - something went wrong |

---

## Post Status Lifecycle

```
draft → scheduled → publishing → published
                          ↓
                      failed (can retry)
```

**Status Explanations:**

- **draft** - Post created but not scheduled or published
- **scheduled** - Post scheduled for future publishing (auto-publishes via cron job)
- **publishing** - Post is being published to Instagram (usually 1-60 seconds, videos take longer)
- **published** - Post successfully published to Instagram
- **failed** - Publishing failed (check `errorMessage` field, can retry up to 3 times)

---

## Error Handling

All errors return JSON in this format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {}  // Optional additional error details
}
```

**Common Error Codes:**

- `INVALID_TOKEN` - JWT token is invalid or expired
- `ACCOUNT_NOT_FOUND` - Instagram account not found
- `TOKEN_EXPIRED` - Instagram access token expired (user needs to reconnect)
- `POST_NOT_FOUND` - Post ID not found
- `UNAUTHORIZED` - User doesn't own this resource
- `VALIDATION_ERROR` - Request validation failed
- `UPLOAD_ERROR` - File upload failed
- `PUBLISH_ERROR` - Instagram API publish failed
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP address
- **Applies to:** All `/api/posts` endpoints
- **Headers returned:**
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

**429 Response:**
```json
{
  "error": "Too many requests, please try again later",
  "retryAfter": 900  // seconds until reset
}
```

---

## Cron Scheduler

The post scheduler runs automatically every minute:

**Schedule:** `* * * * *` (every minute)

**What it does:**
1. Finds posts where `status === 'scheduled'` and `scheduledFor <= Date.now()`
2. For each post:
   - Validates Instagram account exists
   - Checks token hasn't expired
   - Calls Instagram API to publish
   - Updates post status to `published` or `failed`
3. Retries failed posts (up to 3 attempts with 1-hour cooldown)

**Logs:**
```
✅ Post Scheduler: Found 3 posts ready to publish
✅ Published post 507f1f77bcf86cd799439011 successfully
❌ Failed to publish post 507f1f77bcf86cd799439012: Token expired
🔄 Retrying failed post 507f1f77bcf86cd799439013 (attempt 2/3)
```

---

## Instagram API Integration

### Publishing Flow

**1. Single Image/Video:**
```
Upload media → Create IG media container → Publish container → Get permalink
```

**2. Carousel (2-10 images):**
```
Upload images → Create container for each → Create carousel container → Publish → Get permalink
```

**3. Video:**
```
Upload video → Create video container → Wait for processing → Check status → Publish → Get permalink
```

### Instagram Graph API Calls

**Create Media Container (Step 1):**
```http
POST https://graph.facebook.com/v18.0/{ig-user-id}/media
Content-Type: application/json

{
  "image_url": "https://your-domain.com/uploads/posts/image.jpg",
  "caption": "Amazing photo! #test",
  "location_id": "213385402",
  "access_token": "USER_ACCESS_TOKEN"
}

Response:
{
  "id": "17895695668004550"  // media container ID
}
```

**Publish Container (Step 2):**
```http
POST https://graph.facebook.com/v18.0/{ig-user-id}/media_publish
Content-Type: application/json

{
  "creation_id": "17895695668004550",
  "access_token": "USER_ACCESS_TOKEN"
}

Response:
{
  "id": "18012345678901234"  // Instagram post ID
}
```

**Get Post Details (Step 3):**
```http
GET https://graph.facebook.com/v18.0/18012345678901234
  ?fields=id,permalink,timestamp
  &access_token=USER_ACCESS_TOKEN

Response:
{
  "id": "18012345678901234",
  "permalink": "https://www.instagram.com/p/ABC123/",
  "timestamp": "2024-01-10T18:00:00+0000"
}
```

---

## Testing with Postman/Insomnia

### Collection Setup

1. **Create Environment Variable:**
```json
{
  "baseUrl": "http://localhost:5000",
  "authToken": "YOUR_JWT_TOKEN"
}
```

2. **Set Authorization Header:**
```
Authorization: Bearer {{authToken}}
```

3. **Test Sequence:**

**A. Upload Media:**
```
POST {{baseUrl}}/api/posts/upload
Body: form-data
  media: [select file]
```

**B. Create Draft Post:**
```
POST {{baseUrl}}/api/posts
Content-Type: application/json

{
  "instagramAccountId": "507f1f77bcf86cd799439011",
  "mediaUrl": "/uploads/posts/1703001234567-photo.jpg",
  "mediaType": "image",
  "caption": "Test post",
  "hashtags": ["test"]
}
```

**C. Publish Immediately:**
```
POST {{baseUrl}}/api/posts/{{postId}}/publish
```

**D. Check Status:**
```
GET {{baseUrl}}/api/posts/{{postId}}
```

---

## Code Examples

### React Hook for Post Creation

```typescript
import { useState } from 'react';

interface CreatePostData {
  instagramAccountId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'carousel';
  caption: string;
  hashtags: string[];
  location?: LocationResult;
  scheduledFor?: string;
}

export function useCreatePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadMedia = async (file: File) => {
    const formData = new FormData();
    formData.append('media', file);

    const response = await fetch(`${API_URL}/api/posts/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  };

  const createPost = async (data: CreatePostData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create post');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const publishPost = async (postId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/publish`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) throw new Error('Failed to publish');
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadMedia,
    createPost,
    publishPost,
    loading,
    error,
  };
}
```

### Usage Example:

```typescript
function CreatePostForm() {
  const { uploadMedia, createPost, publishPost, loading } = useCreatePost();
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);

  const handleSubmit = async () => {
    // 1. Upload media
    const uploaded = await uploadMedia(selectedFile);
    setMediaFile(uploaded);

    // 2. Create post
    const { post } = await createPost({
      instagramAccountId: selectedAccount,
      mediaUrl: uploaded.url,
      mediaType: uploaded.type,
      caption: captionText,
      hashtags: hashtagArray,
    });

    // 3. Publish immediately
    await publishPost(post._id);

    // Done!
    router.push('/dashboard/posts');
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## Support

For API questions or issues:
- Check backend logs: `backend/logs/error.log`
- Check post status and errorMessage in database
- Verify Instagram account token hasn't expired
- Test endpoints with Postman/Insomnia first
- Check Instagram API status: https://developers.facebook.com/status/

---

*API Version: 1.0.0*
*Last Updated: January 2024*
