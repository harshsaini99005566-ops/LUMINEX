# Meta Permissions 1-7: Feature Requirements for SaaS Platform

**Document Purpose**: Product feature requirements for Meta app review submission  
**Target**: Development team implementation and Meta app reviewers  
**Date**: March 6, 2026  
**Project**: LUMINEX (Instagram & Facebook Automation SaaS)

---

## 📋 Overview

This document outlines the **7 core product features** required to support Meta permissions for Instagram Business accounts and Facebook Pages integration. These features enable users to automate communication, manage content, and analyze performance.

**Meta App Review Focus**: Product features only (what users can do), not technical API implementation.

---

## 1️⃣ Feature 1: Facebook Login

**Permission Required**: `email`, `public_profile`

### User Story
As a user, I want to log in to the platform using my Facebook account so I can quickly access the system without creating a new account.

### Feature Behavior

1. User visits the login page
2. User clicks **"Login with Facebook"** button
3. Facebook authentication window opens
4. User authorizes the application
5. User is redirected to the SaaS dashboard
6. Platform automatically creates/updates user account
7. Dashboard displays user's Facebook name and profile picture

### UI Requirements

**Login Page Components**:
- "Login with Facebook" button with Facebook branding
- Alternative email/password login option
- Terms of service agreement

**Dashboard Header Display**:
- User's full name from Facebook
- User's profile avatar/picture
- Logout option

### Success Criteria
- ✅ User can authenticate via Facebook OAuth
- ✅ Account is created on first login
- ✅ Profile information is displayed correctly
- ✅ Session persists across page refreshes

---

## 2️⃣ Feature 2: Facebook Page Connection

**Permission Required**: `pages_show_list`, `pages_read_engagement`, `pages_manage_metadata`

### User Story
As a user, I want to connect my Facebook Pages to the platform so I can manage all my pages' Instagram accounts from one dashboard.

### Feature Behavior

After successful Facebook login:

1. Platform displays **"Connect Facebook Page"** option
2. System fetches all Facebook Pages user manages/owns
3. User sees list of available Pages with details
4. User selects which Page(s) to connect
5. Selected Page becomes linked to the platform
6. Success confirmation is displayed

### UI Requirements

**Page Selection Interface**:
- List view showing all available Pages
- Each Page displays:
  - Page name
  - Page profile picture
  - Page category (optional)
  - **"Connect"** button

**Post-Connection Display**:
- Success message: "✅ Page Connected Successfully"
- Connected Page appears in "My Connected Pages" list
- Option to connect additional Pages
- Option to disconnect Pages

### Data Displayed
- Number of Pages connected
- Page names and avatars
- Connection status (active/inactive)

### Success Criteria
- ✅ User can view all Pages they manage
- ✅ User can select and connect Pages
- ✅ Connected Pages are saved to user account
- ✅ User can manage multiple Pages

---

## 3️⃣ Feature 3: Instagram Business Account Connection

**Permission Required**: `instagram_basic`

### User Story
As a user, I want my Instagram Business accounts to be automatically detected when I connect my Facebook Page so I can start automating Instagram without extra steps.

### Feature Behavior

After Facebook Page connection:

1. Platform automatically detects Instagram Business account linked to the Page
2. System retrieves Instagram account information:
   - Username
   - Profile picture
   - Follower count
   - Business account ID
3. Instagram account is automatically connected to the platform
4. Instagram profile information appears in dashboard

### UI Requirements

**Instagram Account Display**:
- Instagram username (with @ symbol)
- Profile picture/avatar
- Follower count
- Connection status badge (green = active)
- Account type indicator (Business/Creator)

**Account Card Shows**:
- Instagram handle
- Number of followers
- Last sync time
- Quick action buttons:
  - View Analytics
  - Manage Messages
  - Settings

### Success Criteria
- ✅ Instagram account auto-detects from Facebook Page
- ✅ Profile information displays correctly
- ✅ Follower count updates regularly
- ✅ Connection status is clearly indicated

---

## 4️⃣ Feature 4: Instagram Direct Message Inbox with AI Replies

**Permission Required**: `instagram_manage_messages`

### User Story
As a user, I want to view and respond to Instagram DMs in the platform with AI-powered automation so I can engage with followers efficiently.

### Feature Behavior

**Message Reception**:
- Incoming Instagram DMs appear in real-time in the platform inbox
- Conversations are organized by customer
- Message history is preserved
- Unread messages are highlighted

**AI Automation**:
- AI automatically analyzes incoming messages
- AI generates contextually relevant replies
- User can enable/disable AI automation per conversation
- AI learns from user corrections

**Manual Override**:
- User can manually respond to any message
- User can edit AI-generated replies before sending
- User can take over conversation from AI at any time

### UI Requirements

**Inbox Dashboard**:
- **Left Sidebar**: List of conversations
  - Participant name/username
  - Profile picture
  - Last message preview
  - Timestamp
  - Unread badge (if applicable)
  
- **Main Chat Area**: Selected conversation
  - Full message history (scrollable)
  - Incoming messages (left-aligned, dark background)
  - Outgoing messages (right-aligned, colored background)
  - Message timestamps
  - Delivery status indicators

- **Reply Section** (bottom):
  - Text input box for manual replies
  - AI suggestion box (when enabled)
  - "Send" button
  - "Use AI Reply" button
  - Emoji picker

**Message Types Supported**:
- Text messages
- Image attachments
- Video attachments
- Quick replies

### AI Reply Features
- 🤖 Automatic response generation
- ⚡ Responds within 5 seconds
- 💡 Contextual understanding
- 🎯 Learns from conversation history
- ✏️ User can edit before sending

### Success Criteria
- ✅ All DMs appear in inbox
- ✅ AI generates relevant replies
- ✅ User can manually respond
- ✅ Conversation history is preserved
- ✅ Real-time message updates

---

## 5️⃣ Feature 5: Instagram Comment Management

**Permission Required**: `instagram_manage_comments`

### User Story
As a user, I want to monitor and reply to comments on my Instagram posts with automated responses so I can engage with my audience at scale.

### Feature Behavior

**Comment Monitoring**:
- New comments on Instagram posts appear in the dashboard
- Comments are linked to their original posts
- User can see comment author information
- Comments update in real-time

**AI Reply System**:
- AI automatically generates reply suggestions
- AI considers post context and comment tone
- User can approve/edit AI-generated replies
- Option to set auto-reply rules for specific keywords

**Manual Management**:
- User can manually reply to any comment
- User can hide/delete spam comments
- User can like comments directly from dashboard

### UI Requirements

**Comment Management Panel**:

**List View Displays**:
- Comment text (full or truncated)
- Commenter's username
- Commenter's profile picture
- Post thumbnail/preview
- Timestamp
- Number of likes on comment

**Detail View Shows**:
- Full comment text
- Original post image/video
- Post caption
- AI-generated reply suggestion
- Manual reply input box
- Actions:
  - Reply button
  - Hide button
  - Like button
  - Mark as spam

**Filters**:
- All comments
- Unanswered
- Awaiting review
- Spam
- By post

### Success Criteria
- ✅ Comments appear from all posts
- ✅ User can see associated post
- ✅ AI suggests relevant replies
- ✅ User can respond directly
- ✅ Comment actions work properly

---

## 6️⃣ Feature 6: Instagram Analytics Dashboard

**Permission Required**: `instagram_basic`, `pages_read_engagement`

### User Story
As a user, I want to view performance metrics for my Instagram account so I can understand my audience and optimize my content strategy.

### Feature Behavior

The analytics dashboard provides real-time and historical insights:

**Metrics Tracked**:
- **Follower count**: Total and growth over time
- **Reach**: Number of unique accounts reached
- **Impressions**: Total views across all content
- **Engagement rate**: Likes, comments, shares percentage
- **Profile visits**: Account page views
- **DM reply rate**: Percentage of messages responded to
- **Top performing posts**: Most engaged content
- **Audience activity times**: When followers are online

**Time Ranges**:
- Last 7 days
- Last 30 days
- Last 90 days
- Custom date range

### UI Requirements

**Analytics Dashboard Layout**:

**Top Metrics Cards** (4-column grid):
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ FOLLOWERS   │ │ REACH       │ │ ENGAGEMENT  │ │ MESSAGES    │
│   15,234    │ │   45,123    │ │    8.5%     │ │     342     │
│   ↑ +5.2%   │ │   ↑ +12%    │ │   ↑ +2.1%   │ │   ↑ +18     │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

**Charts & Visualizations**:
- Line chart: Follower growth over time
- Bar chart: Daily engagement rates
- Pie chart: Content type performance
- Heatmap: Audience activity by hour/day

**Performance Tables**:
- Top 10 posts by engagement
- Most active followers
- Hashtag performance
- Story insights (if applicable)

**Export Options**:
- Download as PDF report
- Export as CSV data
- Schedule email reports

### Success Criteria
- ✅ All key metrics display accurately
- ✅ Data refreshes automatically
- ✅ Charts are interactive and clear
- ✅ Historical data is accessible
- ✅ Reports can be exported

---

## 7️⃣ Feature 7: Instagram Post Publishing Tool

**Permission Required**: `instagram_content_publish`

### User Story
As a user, I want to create and publish Instagram posts directly from the platform so I can manage my content without leaving the dashboard.

### Feature Behavior

**Content Creation**:
- User can upload images (JPG, PNG)
- User can upload videos (MP4, MOV)
- User can upload carousel posts (multiple images)
- User can write caption (with character count)
- User can add hashtags with suggestions
- User can tag location (optional)
- User can @ mention other accounts

**Publishing Options**:
- **Publish Now**: Post immediately to Instagram
- **Schedule**: Select future date/time for posting
- **Save as Draft**: Save for later editing

**Post Preview**:
- Shows how post will appear on Instagram
- Displays caption, hashtags, and location
- Preview image/video rendering

### UI Requirements

**Post Creation Interface**:

**Media Upload Area**:
- Drag-and-drop zone
- File browser button
- Supported formats clearly indicated
- Image/video preview after upload
- Crop/resize tools
- Filter options (optional)

**Caption Editor**:
- Multi-line text input box
- Character counter (2,200 limit)
- Emoji picker
- Hashtag suggestions
- Mention autocomplete (@username)

**Metadata Section**:
- Location search/selector
- Alt text for accessibility
- First comment option

**Publishing Controls**:
- "Publish Now" button (primary)
- "Schedule Post" button
- "Save as Draft" button
- "Preview" button

**Scheduling Interface** (when scheduling):
- Calendar date picker
- Time selector (with timezone)
- Optimal posting time suggestions
- Scheduled posts list

### Post Management
- View all scheduled posts
- Edit scheduled posts
- Cancel/delete scheduled posts
- View post history
- See publish status (published, scheduled, failed)

### Success Criteria
- ✅ User can upload media files
- ✅ Caption and hashtags save correctly
- ✅ Posts publish to Instagram successfully
- ✅ Scheduled posts publish at correct time
- ✅ User receives publish confirmation
- ✅ Failed posts show error messages

---

## 🔄 Complete SaaS Workflow

The platform supports the following end-to-end user journey:

### Step 1: Authentication
```
User → Login with Facebook → Authorize → Dashboard
```

### Step 2: Account Connection
```
Dashboard → Connect Facebook Page → Instagram Auto-Detected → Connected
```

### Step 3: Automation Setup
```
Connected Account → Configure AI Settings → Enable Automation
```

### Step 4: Message Management
```
Incoming DMs → AI Generates Replies → User Approves/Edits → Send
```

### Step 5: Comment Engagement
```
New Comments → AI Suggests Replies → User Responds → Track Engagement
```

### Step 6: Analytics Review
```
View Dashboard → Analyze Metrics → Export Reports → Optimize Strategy
```

### Step 7: Content Publishing
```
Create Post → Add Caption → Schedule/Publish → Monitor Performance
```

---

## 📊 Feature Matrix

| Feature | Permission Required | User Action | Automation | Status |
|---------|-------------------|-------------|------------|--------|
| Facebook Login | `public_profile`, `email` | Click login button | Auto account creation | ✅ Required |
| Page Connection | `pages_show_list` | Select pages to connect | Fetch pages API | ✅ Required |
| IG Auto-Connect | `instagram_basic` | None (automatic) | Detect linked IG accounts | ✅ Required |
| DM Inbox | `instagram_manage_messages` | View & reply to DMs | AI reply generation | ✅ Required |
| Comment Mgmt | `instagram_manage_comments` | Monitor & reply to comments | AI reply suggestions | ✅ Required |
| Analytics | `instagram_basic`, `pages_read_engagement` | View metrics dashboard | Data sync every 4 hours | ✅ Required |
| Post Publishing | `instagram_content_publish` | Create & publish posts | Schedule automation | ✅ Required |

---

## 🎯 Meta App Review Requirements

### What Reviewers Will Check

1. **User Flow Demonstration**:
   - Screen recording showing complete workflow
   - From login → page connection → Instagram use

2. **Permission Justification**:
   - Clear explanation of why each permission is needed
   - How it benefits the user experience

3. **Privacy & Data Usage**:
   - What data is collected
   - How data is stored and used
   - User control over their data

4. **Terms of Service & Privacy Policy**:
   - Must be publicly accessible
   - Must explain data usage clearly

### Demo Script for Meta Review

```
1. Show login page with Facebook button
2. Click "Login with Facebook" - show OAuth flow
3. After login, show dashboard with user's Facebook info
4. Click "Connect Facebook Page" - show page list
5. Select a page - show Instagram auto-detection
6. Navigate to Inbox - show DM conversation
7. Show AI reply generation in action
8. Navigate to Comments - show comment management
9. Open Analytics - show all metrics
10. Create sample post - show publishing flow
```

---

## 🔐 Required Meta Permissions Summary

| Permission | Purpose | Feature(s) |
|-----------|---------|-----------|
| `email` | User identification | Login |
| `public_profile` | Display user info | Login, Dashboard |
| `pages_show_list` | List Facebook Pages | Page Connection |
| `pages_read_engagement` | Read page metrics | Analytics |
| `pages_manage_metadata` | Manage page info | Page Settings |
| `instagram_basic` | Access basic IG data | Profile, Analytics |
| `instagram_manage_messages` | Send/receive DMs | Inbox Feature |
| `instagram_manage_comments` | Post/manage comments | Comment Management |
| `instagram_content_publish` | Create IG posts | Publishing Tool |

---

## 📝 Implementation Checklist

### Frontend Requirements
- [ ] Facebook Login button
- [ ] Facebook Page selector UI
- [ ] Instagram account display cards
- [ ] DM inbox interface with chat UI
- [ ] Comment management panel
- [ ] Analytics dashboard with charts
- [ ] Post creation form with media upload
- [ ] Scheduled posts calendar

### Backend Requirements
- [ ] Facebook OAuth integration
- [ ] Facebook Pages API calls
- [ ] Instagram Business Account API
- [ ] Webhook receiver for DMs
- [ ] Webhook receiver for comments
- [ ] AI reply generation service
- [ ] Analytics data aggregation
- [ ] Post publishing API integration
- [ ] Job scheduler for scheduled posts

### Database Requirements
- [ ] User accounts (Facebook-linked)
- [ ] Connected Facebook Pages
- [ ] Connected Instagram accounts
- [ ] Message history storage
- [ ] Comment history storage
- [ ] Analytics metrics cache
- [ ] Scheduled posts queue
- [ ] AI training data

---

## 🚀 Launch Preparation

### Pre-Launch Validation

1. **Test All Features**:
   - Complete user journey testing
   - Edge case handling
   - Error message clarity

2. **Performance Testing**:
   - Load testing for multiple users
   - Message delivery speed
   - Analytics data refresh performance

3. **Security Audit**:
   - OAuth token security
   - User data encryption
   - API rate limiting

4. **Documentation**:
   - User guide/help center
   - Video tutorials
   - FAQ section

### Meta App Review Submission

**Required Materials**:
1. Screen recording (< 10 minutes)
2. App screenshots (5-10 images)
3. Privacy policy URL
4. Terms of service URL
5. Detailed use case explanation
6. Test user credentials (for Meta reviewers)

**Timeline**:
- Submission: 1-2 hours
- Review process: 3-7 days
- Resubmission (if needed): 2-3 days

---

## 📞 Support & Resources

### Meta Resources
- Meta for Developers: https://developers.facebook.com
- Instagram Graph API Docs: https://developers.facebook.com/docs/instagram-api
- App Review Guidelines: https://developers.facebook.com/docs/app-review

### Internal Documentation
- Technical implementation guide (separate document)
- API integration specifications
- Database schema documentation
- Testing procedures

---

## ✅ Summary

This document outlines **7 core product features** that deliver value to users while supporting Meta's required permissions:

1. ✅ **Facebook Login** - Seamless authentication
2. ✅ **Page Connection** - Manage multiple pages
3. ✅ **Instagram Auto-Connect** - Zero-friction setup
4. ✅ **DM Inbox + AI** - Automated customer engagement
5. ✅ **Comment Management** - Scale audience interaction
6. ✅ **Analytics Dashboard** - Data-driven insights
7. ✅ **Post Publishing** - Centralized content management

**Result**: Complete Instagram & Facebook automation platform that reviewers can understand and users can benefit from.

---

**Document Version**: 1.0  
**Last Updated**: March 6, 2026  
**Next Review**: After development completion
