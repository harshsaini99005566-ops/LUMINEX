# System Flow & Module Interactions

## Overview
This document details the flow of data and interactions between different modules of the AutoDM SaaS platform.

## 1. Authentication Module Flow

### Signup Process
```
┌─────────────────────────────────────────────────────────┐
│ Frontend: SignupPage                                     │
├─────────────────────────────────────────────────────────┤
│ 1. User enters email, password                          │
│ 2. Frontend validates input                             │
│ 3. POST /auth/register                                  │
│ 4. Loading state...                                     │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Backend: AuthRoutes & AuthService                        │
├─────────────────────────────────────────────────────────┤
│ 1. Validate input (validators.js)                       │
│ 2. Check if email exists                                │
│ 3. Hash password (bcrypt)                               │
│ 4. Create User document in MongoDB                      │
│ 5. Create default Subscription (free plan)              │
│ 6. Generate JWT token                                   │
│ 7. Return token + user data                             │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Frontend: Store & Redirect                              │
├─────────────────────────────────────────────────────────┤
│ 1. Store JWT in localStorage                            │
│ 2. Update Zustand store                                 │
│ 3. Redirect to /dashboard                               │
└─────────────────────────────────────────────────────────┘
```

### Login Process
```
POST /auth/login
  ├─ Find user by email
  ├─ Compare password with hash
  ├─ Generate JWT token
  └─ Return token
```

---

## 2. Instagram Integration Module Flow

### Account Connection Flow
```
Frontend: Settings Page
  │
  ├─ User clicks "Connect Instagram"
  │
  ├─ Frontend → Instagram OAuth URL
  │   (Redirects to Instagram's authorization endpoint)
  │
  └─ User grants permissions
       │
       ├─ Instagram redirects to /auth/instagram/callback
       │   with authorization code
       │
       ├─ Backend exchanges code for access token
       │
       ├─ Fetch user profile from Instagram Graph API
       │
       ├─ Create InstagramAccount document
       │   - Store encrypted access token
       │   - Store refresh token
       │   - Link to User
       │
       └─ Frontend shows account as connected
```

### Real-time Message Reception Flow
```
Instagram User sends DM to connected account
  │
  ├─ Instagram → Webhook (configured in app settings)
  │   POST /webhook/instagram
  │
  ├─ Webhook Signature Verification
  │
  ├─ Extract message details:
  │   - Sender ID
  │   - Message content
  │   - Media (if any)
  │   - Timestamp
  │
  ├─ Create Message document
  │
  ├─ Create/Update Conversation
  │
  ├─ Trigger Rule Engine
  │
  ├─ If rule matches:
  │   ├─ Generate auto-response
  │   ├─ Send via Instagram API
  │   ├─ Mark message as automated
  │
  └─ Emit WebSocket event to frontend
     (Real-time inbox update)
```

---

## 3. Rule Engine Module Flow

### Rule Creation
```
Frontend: RuleBuilder Component
  │
  ├─ User defines:
  │   ├─ Rule name
  │   ├─ Triggers (keywords, hashtags, mentions)
  │   ├─ Conditions (user type, message length)
  │   └─ Actions (auto-response, forward)
  │
  ├─ Validation on frontend
  │
  └─ POST /rules
       │
       ├─ Backend: Create AutomationRule document
       │
       ├─ Load rule into RuleEngine memory cache
       │
       ├─ Mark as active
       │
       └─ Return success to frontend
```

### Rule Matching Flow
```
Webhook receives message
  │
  ├─ Get message content
  │
  ├─ Load all active rules for this account
  │
  ├─ For each rule:
  │   ├─ Check trigger conditions
  │   │   ├─ Keyword matching (case-insensitive)
  │   │   ├─ Hashtag detection
  │   │   ├─ Mention detection
  │   │   └─ Additional conditions
  │   │
  │   └─ If conditions met:
  │       ├─ Build response message
  │       ├─ Apply delays if configured
  │       ├─ Send via Instagram API
  │       └─ Log the automation
  │
  └─ Complete webhook response
```

### Rule Performance Tracking
```
Each matched rule increments:
  ├─ matchCount (total matches)
  ├─ Last activated timestamp
  └─ Store in analytics table
```

---

## 4. Messaging Module Flow

### Inbox Display
```
Frontend: Inbox Component
  │
  ├─ On page load: GET /conversations
  │
  ├─ Backend:
  │   ├─ Query Conversations for user's accounts
  │   ├─ Get latest message for each
  │   ├─ Include sender info, timestamp
  │   └─ Return sorted by recency
  │
  ├─ Frontend: Display conversation list
  │
  └─ User clicks conversation
       │
       ├─ GET /conversations/:id/messages
       │
       ├─ Backend: Fetch messages (paginated)
       │
       ├─ Frontend: Display thread
       │
       └─ PUT /conversations/:id/read
           (Mark as read)
```

### Manual Message Sending
```
Frontend: Compose message
  │
  ├─ User types response
  │
  ├─ POST /conversations/:id/messages
  │   {
  │     "content": "message text",
  │     "type": "manual"
  │   }
  │
  ├─ Backend:
  │   ├─ Validate message
  │   ├─ Send via Instagram API
  │   ├─ Create Message document
  │   ├─ Update Conversation
  │   ├─ Log activity
  │   └─ Return message object
  │
  └─ Frontend: Add to chat immediately (optimistic update)
```

---

## 5. Billing & Subscription Module Flow

### Subscription Upgrade Flow
```
Frontend: Billing Page
  │
  ├─ Display available plans with features
  │
  ├─ User selects plan
  │
  ├─ POST /billing/create-checkout
  │   { "planId": "pro" }
  │
  ├─ Backend:
  │   ├─ Validate plan
  │   ├─ Call Stripe API
  │   ├─ Create checkout session
  │   └─ Return session ID
  │
  ├─ Frontend: Redirect to Stripe checkout
  │
  ├─ User: Completes payment
  │
  ├─ Stripe Webhook → Backend
  │   POST /billing/webhook
  │   event: charge.succeeded
  │
  ├─ Backend:
  │   ├─ Verify webhook signature
  │   ├─ Update Subscription document
  │   ├─ Activate pro features
  │   ├─ Send confirmation email
  │   └─ Log transaction
  │
  └─ User: Features unlocked immediately
```

### Subscription Renewal
```
Stripe (scheduled monthly):
  │
  ├─ Charges recurring payment
  │
  ├─ Webhook: invoice.payment_succeeded
  │
  ├─ Backend updates Subscription
  │   ├─ Extends currentPeriodEnd
  │   └─ Keeps status = active
  │
  └─ User continues service seamlessly
```

### Subscription Cancellation
```
Frontend: Billing settings
  │
  ├─ User clicks "Cancel subscription"
  │
  ├─ POST /billing/cancel
  │
  ├─ Backend:
  │   ├─ Update Subscription:
  │   │   ├─ status = canceled
  │   │   ├─ canceledAt = now
  │   │
  │   ├─ Call Stripe API (cancel subscription)
  │   │
  │   ├─ Send cancellation email
  │   │
  │   └─ Return confirmation
  │
  └─ Downgrade to free plan at period end
```

---

## 6. Analytics Module Flow

### Dashboard Statistics
```
Frontend: Dashboard
  │
  ├─ On load: GET /instagram/accounts/:id/stats
  │
  ├─ Backend:
  │   ├─ Count total messages (this period)
  │   ├─ Count automated responses
  │   ├─ Calculate response time average
  │   ├─ Get top matching rules
  │   ├─ Calculate engagement rate
  │   └─ Return analytics object
  │
  ├─ Frontend: Render StatsGlobe & charts
  │
  └─ Real-time updates via WebSocket
     (When messages arrive)
```

### Rule Analytics
```
GET /rules/:id/analytics
  │
  ├─ Fetch rule performance data
  │   ├─ Total matches
  │   ├─ Successful automations
  │   ├─ Failed attempts
  │   ├─ Average response time
  │   └─ Trend (last 7/30 days)
  │
  └─ Display in rule detail view
```

---

## 7. Error Handling Flow

### Global Error Handler
```
Any endpoint encounters error
  │
  ├─ Error middleware catches exception
  │
  ├─ Log error with context:
  │   ├─ Endpoint
  │   ├─ User ID
  │   ├─ Error message
  │   ├─ Stack trace
  │   └─ Timestamp
  │
  ├─ Determine error type:
  │   ├─ 400: Validation error
  │   ├─ 401: Unauthorized
  │   ├─ 403: Forbidden
  │   ├─ 404: Not found
  │   ├─ 429: Rate limited
  │   └─ 500: Server error
  │
  ├─ Return JSON response with error details
  │
  └─ Frontend: Display user-friendly message
     (from translations/i18n)
```

---

## 8. Cache & Performance Flow

### Rule Engine Cache
```
On startup:
  ├─ Load all active rules from DB
  ├─ Store in memory cache (Redis optional)
  ├─ Index by account ID
  └─ Ready for fast matching

On rule change:
  ├─ Invalidate relevant cache
  ├─ Reload from database
  └─ Update memory
```

### Database Indexing
```
Indexes created on:
  ├─ User email (unique)
  ├─ InstagramAccount userId
  ├─ AutomationRule accountId
  ├─ Message conversationId
  ├─ Conversation accountId
  └─ Subscription userId
```

---

## 9. Security & Authentication Flow

### JWT Validation
```
Each protected request:
  │
  ├─ Extract JWT from header
  │
  ├─ Verify signature
  │
  ├─ Check expiration
  │
  ├─ Extract user ID
  │
  └─ Attach to request object
     (req.user = decoded token)
```

### Rate Limiting
```
Per user, per endpoint:
  ├─ Track request count
  ├─ Reset on interval (15 min)
  ├─ If exceeded: return 429
  └─ Protect against abuse
```

---

## 10. Deployment & Scaling Flow

### Container Orchestration
```
Production deployment:
  │
  ├─ Multiple backend containers (load balanced)
  │   ├─ Auto-scale based on CPU/memory
  │   ├─ Health checks every 30s
  │   └─ Graceful shutdown on updates
  │
  ├─ MongoDB Atlas (managed)
  │   ├─ Automatic backups
  │   ├─ Replication
  │   └─ Connection pooling
  │
  ├─ Frontend (Vercel CDN)
  │   ├─ Global distribution
  │   ├─ Automatic deployments
  │   └─ Edge functions
  │
  └─ Redis (optional)
     ├─ Session store
     ├─ Cache layer
     └─ Pub/Sub for real-time
```

---

## Module Interaction Summary

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend Layer                        │
│  (Next.js + React + TypeScript)                          │
└─────────────────────────────────────────────────────────┘
        ▲                    ▲                ▲
        │                    │                │
   HTTP │               WebSocket         WebSocket
        │                    │                │
        ▼                    ▼                ▼
┌──────────────┬─────────────────┬──────────────────┐
│   Auth API   │  Rules Engine   │  Messaging API   │
├──────────────┼─────────────────┼──────────────────┤
│              │                 │                  │
│ ├─ JWT       │ ├─ Matching     │ ├─ Conversations │
│ ├─ Sessions  │ ├─ Automation   │ ├─ Messages      │
│ └─ Users     │ └─ Analytics    │ └─ Real-time     │
│              │                 │                  │
└──────────────┴─────────────────┴──────────────────┘
        ▲              ▲              ▲
        │              │              │
        │              │              │
┌───────┴──────────────┴──────────────┴──────────┐
│           MongoDB Database                      │
│  (Users, Accounts, Rules, Messages, Subs)     │
└────────────────────────────────────────────────┘
        ▲                            ▲
        │                            │
        │                            │
┌──────────────────┐       ┌─────────────────┐
│ Instagram API    │       │  Stripe API     │
│ ├─ Messages      │       │ ├─ Charges      │
│ ├─ User profiles │       │ ├─ Subs         │
│ └─ Webhooks      │       │ └─ Webhooks     │
└──────────────────┘       └─────────────────┘
```

---

**Version**: 1.0.0
**Last Updated**: January 2026
