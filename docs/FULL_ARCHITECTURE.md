# AutoDM SaaS - Complete Architecture & System Flow

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Data Flow](#data-flow)
6. [API Endpoints](#api-endpoints)
7. [Database Schema](#database-schema)
8. [Deployment Architecture](#deployment-architecture)

---

## System Overview

**AutoDM** is a SaaS platform that automates Instagram Direct Messages (DMs) for businesses. It enables users to:
- Connect their Instagram accounts
- Create intelligent automation rules based on keywords, hashtags, and user behavior
- Automatically respond to messages matching specific criteria
- Manage conversations in a unified inbox
- Track analytics and performance metrics
- Handle billing and subscriptions

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser (User)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │ (HTTPS)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Frontend (React + TypeScript)            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Pages: Dashboard, Rules, Inbox, Billing, Settings   │   │
│  │ Components: RuleBuilder, CyberUI, StatsGlobe        │   │
│  │ State Management: Zustand (store.ts)                │   │
│  │ API Client: Axios-based (api.ts)                    │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│         Node.js/Express Backend (Server)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ API Routes:                                          │   │
│  │ ├─ /auth (login, register, logout)                 │   │
│  │ ├─ /instagram (account management)                 │   │
│  │ ├─ /rules (automation rules CRUD)                  │   │
│  │ ├─ /conversations (inbox management)               │   │
│  │ ├─ /billing (Stripe integration)                   │   │
│  │ └─ /webhook (Instagram webhook)                    │   │
│  │                                                      │   │
│  │ Services:                                            │   │
│  │ ├─ InstagramService (Graph API)                    │   │
│  │ ├─ RuleEngine (automation logic)                   │   │
│  │ ├─ StripeService (payments)                        │   │
│  │ └─ WebhookService (real-time updates)              │   │
│  │                                                      │   │
│  │ Middleware:                                          │   │
│  │ ├─ Authentication                                   │   │
│  │ └─ Error Handler                                    │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────┬──────────────────┬──────────────────────────┘
               │                  │
               │ (REST API)       │ (Webhooks)
               ▼                  ▼
    ┌──────────────────┐  ┌──────────────────┐
    │  MongoDB Atlas   │  │  Instagram API   │
    │  Database        │  │  (Real-time DMs) │
    │  ├─ Users        │  │  ├─ Messages     │
    │  ├─ Accounts     │  │  ├─ Conversations
    │  ├─ Rules        │  │  └─ User Profiles
    │  ├─ Messages     │  │                  │
    │  ├─ Conversations│  └──────────────────┘
    │  └─ Subscriptions│
    └──────────────────┘
               ▲
               │ (Stripe webhooks)
               ▼
    ┌──────────────────┐
    │  Stripe API      │
    │  ├─ Charges      │
    │  ├─ Customers    │
    │  └─ Subscriptions│
    └──────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **UI Components**: Custom CyberUI system with Cyber themes

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: JavaScript
- **Database**: MongoDB 7.0 (Atlas)
- **Authentication**: JWT (JSON Web Tokens)
- **External APIs**:
  - Instagram Graph API
  - Stripe API
  - SendGrid (optional for emails)

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Cloud Hosting**: AWS / DigitalOcean / Render
- **CDN**: Cloudflare (optional)
- **Logging**: Winston or Bunyan

---

## Folder Structure

```
AUTO DM 2/
│
├── backend/
│   ├── config/              # Configuration files
│   │   ├── database.js      # MongoDB connection
│   │   ├── env.js           # Environment variables
│   │   └── instagram.js     # Instagram API config
│   │
│   ├── src/
│   │   ├── server.js        # Express app entry point
│   │   ├── middleware/      # Express middleware
│   │   │   ├── auth.js      # JWT authentication
│   │   │   └── errorHandler.js
│   │   │
│   │   ├── models/          # MongoDB schemas
│   │   │   ├── User.js      # User model
│   │   │   ├── InstagramAccount.js
│   │   │   ├── AutomationRule.js
│   │   │   ├── Message.js
│   │   │   ├── Conversation.js
│   │   │   └── Subscription.js
│   │   │
│   │   ├── routes/          # API endpoints
│   │   │   ├── auth.js      # /auth endpoints
│   │   │   ├── instagram.js # /instagram endpoints
│   │   │   ├── rules.js     # /rules endpoints
│   │   │   ├── conversations.js
│   │   │   ├── billing.js   # /billing (Stripe)
│   │   │   └── webhook.js   # Instagram webhooks
│   │   │
│   │   ├── services/        # Business logic
│   │   │   ├── instagram.js # Instagram Graph API
│   │   │   ├── ruleEngine.js # Automation logic
│   │   │   └── stripe.js    # Payment processing
│   │   │
│   │   └── utils/           # Utilities
│   │       ├── logger.js    # Logging
│   │       └── validators.js
│   │
│   ├── tests/               # Unit tests
│   ├── migrations/          # Database migrations
│   ├── logs/                # Application logs
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page / Landing
│   │   ├── login/           # /login page
│   │   ├── signup/          # /signup page
│   │   └── dashboard/       # Protected routes
│   │       ├── page.tsx     # Dashboard home
│   │       ├── accounts/    # Account management
│   │       ├── inbox/       # Messages
│   │       ├── rules/       # Rule editor
│   │       ├── billing/     # Billing settings
│   │       └── settings/    # User settings
│   │
│   ├── components/          # React components
│   │   ├── CyberUI.tsx      # UI system
│   │   ├── CyberGrid.tsx    # Grid component
│   │   ├── DashboardModules.tsx
│   │   ├── RuleBuilder.tsx  # Rule editor
│   │   └── StatsGlobe.tsx   # Analytics viz
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts       # Auth state
│   │   └── useInstagram.ts  # Instagram state
│   │
│   ├── lib/                 # Utilities
│   │   ├── api.ts           # API client
│   │   └── store.ts         # Zustand store
│   │
│   ├── types/               # TypeScript types
│   │   └── index.ts         # Type definitions
│   │
│   ├── utils/               # Helper functions
│   │   ├── validators.ts
│   │   └── helpers.ts
│   │
│   ├── styles/              # Global styles
│   │   └── globals.css
│   │
│   ├── public/              # Static assets
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.local.example
│
├── docker/                  # Docker configuration
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
├── deployment/              # Deployment scripts
│   ├── production.env
│   └── nginx.conf
│
├── scripts/                 # Automation scripts
│   ├── setup.sh            # Dev setup
│   └── deploy.sh           # Production deploy
│
├── tests/                   # Integration tests
│   ├── e2e/
│   └── api/
│
├── docs/                    # Documentation
│   ├── API.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
│
├── ARCHITECTURE.md          # This file
├── README.md
├── QUICKSTART.md
├── LAUNCH_GUIDE.md
├── BUILD_SUMMARY.md
├── DEPLOYMENT_GUIDE.md
└── INDEX.md
```

---

## Data Flow

### 1. User Authentication Flow
```
User → Login Page
     → API: POST /auth/login
     → Backend: Validate credentials
     → JWT Token Generated
     → Token stored in localStorage
     → Redirect to Dashboard
```

### 2. Instagram Account Connection Flow
```
User → Click "Connect Account"
     → Redirects to Instagram OAuth
     → Instagram → User Approves Permissions
     → Callback to /auth/instagram/callback
     → Backend stores access token
     → Database: InstagramAccount created
     → Frontend: Account listed in settings
```

### 3. Automation Rule Creation Flow
```
User → RuleBuilder Component
     → Defines: Trigger (keywords) + Action (response)
     → API: POST /rules
     → Backend: Validate rule, store in DB
     → RuleEngine loads rule into memory
     → Rule active and listening
```

### 4. Message Automation Flow
```
Instagram User → Sends DM
              → Instagram Webhook → Backend
              → Backend: Check against all rules
              → RuleEngine: Match trigger conditions
              → If match → Generate auto-response
              → API: Send response via Instagram API
              → Message logged in Database
              → Frontend: Show in Inbox (real-time)
```

### 5. Billing Flow
```
User → Billing Page
     → Selects Plan
     → API: POST /billing/create-checkout
     → Backend → Stripe: Create session
     → Frontend: Redirects to Stripe Checkout
     → User → Completes payment
     → Stripe Webhook → Backend
     → Backend: Update Subscription in DB
     → User: Plan upgraded
```

---

## API Endpoints

### Authentication
- `POST /auth/register` - User signup
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh JWT token
- `GET /auth/instagram/callback` - Instagram OAuth callback

### Instagram Accounts
- `GET /instagram/accounts` - List connected accounts
- `POST /instagram/accounts/connect` - Connect new account
- `DELETE /instagram/accounts/:id` - Disconnect account
- `GET /instagram/accounts/:id/stats` - Account analytics

### Automation Rules
- `GET /rules` - List all rules
- `POST /rules` - Create new rule
- `PUT /rules/:id` - Update rule
- `DELETE /rules/:id` - Delete rule
- `POST /rules/:id/activate` - Activate rule
- `POST /rules/:id/deactivate` - Deactivate rule

### Conversations
- `GET /conversations` - Get inbox
- `GET /conversations/:id/messages` - Get conversation
- `POST /conversations/:id/messages` - Send message
- `PUT /conversations/:id/read` - Mark as read

### Billing
- `GET /billing/plans` - List subscription plans
- `POST /billing/create-checkout` - Create Stripe session
- `GET /billing/subscription` - Get current subscription
- `POST /billing/cancel` - Cancel subscription
- `POST /billing/webhook` - Stripe webhook handler

### Webhooks
- `POST /webhook/instagram` - Instagram message webhook

---

## Database Schema

### Users
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  avatar: String,
  subscription: ObjectId (Subscription ref),
  settings: {
    notifications: Boolean,
    theme: String,
    timezone: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### InstagramAccounts
```javascript
{
  _id: ObjectId,
  user: ObjectId (User ref),
  instagramId: String (unique),
  username: String,
  accessToken: String (encrypted),
  refreshToken: String,
  expiresAt: Date,
  profilePicture: String,
  isActive: Boolean,
  connectedAt: Date,
  updatedAt: Date
}
```

### AutomationRules
```javascript
{
  _id: ObjectId,
  account: ObjectId (InstagramAccount ref),
  name: String,
  triggers: {
    keywords: [String],
    hashtags: [String],
    mentions: Boolean
  },
  actions: {
    type: String (auto-response, forward, etc),
    content: String,
    delay: Number (milliseconds)
  },
  isActive: Boolean,
  matchCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Messages
```javascript
{
  _id: ObjectId,
  conversation: ObjectId (Conversation ref),
  sender: ObjectId (User or external),
  content: String,
  mediaUrl: String,
  isAutomated: Boolean,
  ruleApplied: ObjectId (AutomationRule ref),
  timestamp: Date
}
```

### Conversations
```javascript
{
  _id: ObjectId,
  account: ObjectId (InstagramAccount ref),
  instagramUserId: String,
  participantName: String,
  participantAvatar: String,
  messages: [ObjectId (Message ref)],
  lastMessage: String,
  isRead: Boolean,
  startedAt: Date,
  updatedAt: Date
}
```

### Subscriptions
```javascript
{
  _id: ObjectId,
  user: ObjectId (User ref),
  plan: String (free, starter, pro, enterprise),
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  status: String (active, canceled, past_due),
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  canceledAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Deployment Architecture

### Development Environment
- Local MongoDB
- Express dev server (port 5000)
- Next.js dev server (port 3000)
- Hot reload enabled

### Staging Environment
- MongoDB Atlas (shared)
- Backend on Docker
- Frontend on Vercel
- Environment: staging

### Production Environment
- MongoDB Atlas (dedicated)
- Docker containers (AWS ECS / DigitalOcean App Platform)
- Frontend on Vercel or self-hosted Next.js
- Backend load balancer
- Redis cache (optional)
- CDN for static assets

### CI/CD Pipeline
```
Git Push
    ↓
GitHub Actions Trigger
    ├─ Run Tests
    ├─ Lint Code
    ├─ Build Docker images
    ├─ Push to Registry
    └─ Deploy to Production
```

---

## Key Features & Modules

### 1. Rule Engine (Core)
- Pattern matching against incoming messages
- Keyword/hashtag detection
- User-specific rules
- Multi-condition rules
- Rate limiting and cooldown periods

### 2. Real-time Updates
- WebSocket for live message notifications
- Instagram webhook integration
- Database change streams
- Frontend WebSocket client

### 3. Analytics Dashboard
- Message volume charts
- Response time metrics
- Rule performance tracking
- User engagement stats

### 4. Security
- JWT authentication
- Password hashing (bcrypt)
- API rate limiting
- CORS protection
- Environment variable management
- HTTPS only in production

### 5. Scalability
- Horizontal scaling via load balancer
- Database indexing
- Message queue for async tasks
- Redis caching (optional)
- Stateless backend design

---

## Environment Variables

### Backend (.env)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/autodm
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_WEBHOOK_TOKEN=your_webhook_token
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://api.autodm.com
NEXT_PUBLIC_STRIPE_KEY=pk_live_...
```

---

## Getting Started

1. **Install Dependencies**
   ```bash
   npm run setup
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Fill in your API keys

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Run Tests**
   ```bash
   npm run test
   ```

5. **Deploy**
   ```bash
   npm run deploy
   ```

---

## Monitoring & Logging

- Application logs: `/backend/logs/`
- Error tracking: Sentry (optional)
- Performance monitoring: New Relic (optional)
- Database monitoring: MongoDB Atlas UI
- Uptime monitoring: Pingdom/Datadog

---

## Future Enhancements

- [ ] Multi-language support
- [ ] Advanced AI-powered responses
- [ ] Message templates
- [ ] Team collaboration features
- [ ] Mobile app (React Native)
- [ ] WhatsApp/Facebook integration
- [ ] Advanced analytics
- [ ] API for third-party integrations

---

**Last Updated**: January 2026
**Version**: 1.0.0
