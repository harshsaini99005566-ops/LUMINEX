# 🚀 Instagram Post Publishing - Quick Start Guide

## Get Started in 5 Minutes

### 1. Start the Backend (if not running)

```bash
cd backend
npm start
```

You should see:
```
✓ MongoDB connected
✓ Server running on port 5000
✓ Post scheduler started - checking every minute
```

### 2. Navigate to Post Creation

Open your browser and go to:
```
http://localhost:3000/dashboard/posts/create
```

### 3. Create Your First Post

**Step-by-step:**

1. **Select Instagram Account**
   - Choose from dropdown at top of page
   - Must have `instagram_content_publish` permission

2. **Upload Media**
   - Drag and drop an image/video
   - OR click "Browse Files"
   - Supports: JPG, PNG, GIF, MP4, MOV
   - Max size: 100MB

3. **Write Caption**
   - Type your caption (max 2,200 characters)
   - Counter shows remaining characters
   - Preview updates in real-time on right side

4. **Add Hashtags (Optional)**
   - Type hashtag without # symbol
   - Press Enter or click "Add"
   - Remove by clicking × on pill
   - Get suggestions by clicking "Suggest Hashtags"

5. **Add Location (Optional)**
   - Click "Search Location"
   - Type location name
   - Select from results

6. **Choose Publishing Option:**

   **Option A: Publish Immediately**
   - Click **"Publish Now"** button
   - Post goes live on Instagram instantly
   - You'll be redirected to post management page
   - Status will show "Published" ✅

   **Option B: Save as Draft**
   - Click **"Save as Draft"** button
   - Post saved for later editing
   - Can publish or schedule later from management page

   **Option C: Schedule for Later**
   - Select future date from calendar
   - Select time (must be at least 10 minutes in future)
   - Click **"Schedule Post"** button
   - Post will auto-publish at scheduled time
   - Cron job checks every minute for ready posts

### 4. Manage Your Posts

Go to:
```
http://localhost:3000/dashboard/posts
```

**What you'll see:**
- Grid of all your posts with thumbnails
- Status badges (Draft, Scheduled, Published, Failed)
- Filter by account or status
- Switch between grid and list view

**Actions available:**
- **Edit** - Modify draft or scheduled posts
- **Publish Now** - Publish draft immediately
- **Cancel Schedule** - Stop scheduled post from publishing
- **Delete** - Remove non-published posts
- **View on Instagram** - Open published post in new tab
- **Retry** - Retry failed posts

### 5. Test Scheduled Publishing

**Quick 2-minute test:**

1. Create new post from `/dashboard/posts/create`
2. Upload image and write caption
3. Set schedule time to **2 minutes from now**
4. Click "Schedule Post"
5. Go to `/dashboard/posts`
6. See post with "Scheduled" badge
7. Wait 2 minutes...
8. Refresh page
9. Status should change to "Published" ✅

**Behind the scenes:**
- Cron job runs every minute
- Finds posts where `scheduledFor <= currentTime`
- Publishes to Instagram automatically
- Updates status to "published" or "failed"

---

## 🎯 Test Scenarios

### Test 1: Single Image Post
```
1. Upload 1 JPG image
2. Add caption: "Testing single image post! 🚀"
3. Add hashtags: test, automation
4. Click "Publish Now"
5. Check Instagram - post should be live
```

### Test 2: Carousel Post (Multiple Images)
```
1. Upload 3-5 images (use "Upload Multiple" or drag multiple files)
2. Add caption: "Carousel test! Swipe to see more →"
3. Add hashtags: carousel, images
4. Click "Publish Now"
5. Check Instagram - carousel should be live with all images
```

### Test 3: Video Post
```
1. Upload 1 MP4 video (max 60 seconds recommended)
2. Add caption: "Video test! 🎥"
3. Click "Publish Now"
4. Post status will be "publishing" for 30-60 seconds (Instagram processing)
5. Refresh page - should change to "published"
6. Check Instagram - video should be live
```

### Test 4: Scheduled Post
```
1. Create post with image
2. Set schedule for 5 minutes from now
3. Click "Schedule Post"
4. Go to management page - see "Scheduled" status
5. Wait 5 minutes
6. Refresh - status changes to "Published"
7. Check Instagram - post is live
```

### Test 5: Draft and Edit
```
1. Create post with image and caption
2. Click "Save as Draft"
3. Go to management page
4. Click "Edit" on draft post
5. Modify caption and add hashtags
6. Click "Save Changes"
7. Click "Publish Now" from management page
8. Check Instagram - post is live with updated content
```

---

## 📱 Dashboard Navigation

### From Main Dashboard
```
Dashboard Home
└── Posts (sidebar menu)
    ├── Create Post (/dashboard/posts/create)
    ├── Manage Posts (/dashboard/posts)
    └── Edit Post (/dashboard/posts/edit/[id])
```

**Add to your navigation menu:**
```typescript
{
  name: 'Posts',
  href: '/dashboard/posts',
  icon: PhotoIcon, // or your preferred icon
  badge: draftCount, // optional: show draft count
}
```

---

## 🔍 Verify Everything Works

### Backend Health Check
```bash
# Check if server is running
curl http://localhost:5000/health

# Check posts API (replace TOKEN with your JWT)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/posts
```

### Database Check
```javascript
// In MongoDB shell or Compass
db.scheduledposts.find().pretty()

// Should see your created posts with fields:
// - status: 'draft', 'scheduled', 'published', etc.
// - mediaUrl or mediaUrls
// - caption
// - hashtags
// - instagramAccountId
```

### Scheduler Check
```bash
# Check server logs - should see every minute:
"📅 Post Scheduler: Checking for scheduled posts..."
"✅ Post Scheduler: Found X posts ready to publish"
"✅ Published post [post_id] successfully"
```

---

## 🐛 Troubleshooting Quick Fixes

### "Instagram account not found"
- Go to `/dashboard/accounts`
- Click "Connect Instagram Account"
- Complete OAuth flow
- Ensure `instagram_content_publish` permission is granted

### "Failed to publish"
- Check Instagram account token in database
- Verify token hasn't expired (tokens last 60 days)
- Refresh token by reconnecting account

### "Upload failed"
- Check file size (max 100MB)
- Verify file format (JPG, PNG, GIF, MP4, MOV, AVI)
- Check backend logs for detailed error

### "Scheduled post not publishing"
- Check backend server is running
- Look for scheduler logs in console
- Verify post status is "scheduled" not "draft"
- Check scheduledFor date is in the past

### "Video stuck on 'publishing'"
- Videos can take 1-2 minutes to process
- Check back in 5 minutes
- If still stuck, check errorMessage field in database

---

## 📊 Success Metrics

After testing, you should have:

- ✅ At least 1 published single image post on Instagram
- ✅ At least 1 published carousel post (3+ images)
- ✅ At least 1 published video post
- ✅ At least 1 successfully auto-published scheduled post
- ✅ Draft posts saved and edited successfully
- ✅ All posts visible in management dashboard
- ✅ No errors in browser console
- ✅ No errors in backend logs

**You're ready for Meta App Review submission! 🎉**

---

## 🎥 Record Demo for Meta

When submitting Feature 7 to Meta, record this workflow:

1. **Login** - Show user logging into your platform
2. **Navigate** - Go to Posts section
3. **Create** - Create new post with image, caption, hashtags
4. **Preview** - Show Instagram-style preview
5. **Publish** - Click "Publish Now"
6. **Success** - Show success message
7. **Instagram** - Open Instagram app/browser
8. **Verify** - Show post visible on Instagram profile
9. **Manage** - Return to platform, show post in management view
10. **Schedule** - Create another post, schedule for future
11. **Wait** - Fast-forward video to show auto-publishing
12. **Complete** - Show final published state

**Video specs:**
- Maximum 5 minutes
- Screen recording + audio narration
- Show clear UI interactions
- Highlight key features
- End with successful Instagram post

---

## 🎯 Next Steps

1. ✅ Test all scenarios above
2. ✅ Verify posts appear on Instagram
3. ✅ Record demo video
4. ✅ Take screenshots of each step
5. ✅ Prepare Meta App Review submission
6. ⏭️ Submit for approval
7. ⏭️ Deploy to production after approval

**Estimated Time to Production:** 1-2 hours of testing + Meta review (3-7 days)

---

*You're now ready to manage Instagram posts like a pro! 🚀*
