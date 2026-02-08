# AutoDM SaaS - Production Deployment & Setup Guide

## 🚀 PROJECT OVERVIEW

AutoDM is a production-grade Instagram DM & Comment Automation SaaS platform designed for agencies, creators, and marketers. It features AI-powered replies, rule-based automation, and a cyberpunk mission control UI.

### Core Features
- ✅ Auto DM & Comment Replies
- ✅ Keyword-based Rules Engine
- ✅ AI Fallback (OpenAI GPT-4)
- ✅ Human Handoff System
- ✅ Multi-account Management
- ✅ Real-time Dashboard
- ✅ Stripe Subscription Plans
- ✅ Webhook-driven Message Processing

---

## 📁 PROJECT STRUCTURE

```
AUTO DM 2/
├── backend/
│   ├── src/
│   │   ├── server.js                 # Main entry point
│   │   ├── routes/
│   │   │   ├── auth.js              # JWT authentication
│   │   │   ├── rules.js             # Rule CRUD operations
│   │   │   ├── instagram.js         # Instagram account management
│   │   │   ├── webhook.js           # Meta webhook handler
│   │   │   ├── billing.js           # Stripe integration
│   │   │   └── conversations.js     # Message conversation management
│   │   ├── services/
│   │   │   ├── instagram.js         # Instagram API wrapper
│   │   │   ├── ruleEngine.js        # Rule matching & AI processing
│   │   │   └── stripe.js            # Stripe service
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verification
│   │   │   └── errorHandler.js      # Error handling middleware
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── InstagramAccount.js
│   │   │   ├── AutomationRule.js
│   │   │   ├── Message.js
│   │   │   ├── Conversation.js
│   │   │   └── Subscription.js
│   │   └── config/
│   │       └── database.js          # MongoDB connection
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
└── frontend/
    ├── app/
    │   ├── page.tsx                 # Landing page
    │   ├── login/page.tsx
    │   ├── signup/page.tsx
    │   ├── dashboard/page.tsx       # Main dashboard
    │   ├── dashboard/rules/page.tsx
    │   ├── dashboard/billing/page.tsx
    │   ├── layout.tsx
    │   └── globals.css
    ├── components/
    │   ├── CyberUI.tsx              # Core UI components
    │   ├── CyberGrid.tsx            # Animated grid background
    │   ├── StatsGlobe.tsx           # Three.js globe
    │   ├── DashboardModules.tsx     # Dashboard widgets
    │   └── RuleBuilder.tsx          # Multi-step rule wizard
    ├── lib/
    │   ├── api.ts                   # API client
    │   └── store.ts                 # Zustand store
    ├── public/
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.ts
    └── tsconfig.json
```

---

## 🔧 SETUP INSTRUCTIONS

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Stripe account
- Meta/Instagram Graph API credentials
- OpenAI API key

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your credentials:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/auto-dm
JWT_SECRET=your-secret-key-min-32-chars
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_VERIFY_TOKEN=your_verify_token
OPENAI_API_KEY=sk-your-key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
```

Start the server:

```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_KEY=pk_test_your_key
```

Start the dev server:

```bash
npm run dev
```

Open http://localhost:3000

---

## 🌐 DATABASE SCHEMA

### User Collection
```javascript
{
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  plan: String (free|starter|pro|agency),
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  limits: {
    instagramAccounts: Number,
    automationRules: Number,
    aiReplies: Number,
    monthlyMessages: Number
  },
  usage: {
    accountsUsed: Number,
    rulesUsed: Number,
    aiRepliesUsed: Number,
    messagesThisMonth: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### InstagramAccount Collection
```javascript
{
  userId: ObjectId,
  instagramUserId: String (unique),
  username: String,
  accessToken: String,
  isActive: Boolean,
  webhooksSubscribed: Boolean,
  connectedAt: Date
}
```

### AutomationRule Collection
```javascript
{
  userId: ObjectId,
  instagramAccountId: ObjectId,
  name: String,
  triggerType: String (keyword|direct_message|comment),
  keywords: [String],
  matchType: String (exact|contains|starts_with),
  replyType: String (predefined|ai|handoff),
  predefinedReply: String,
  useAI: Boolean,
  aiPrompt: String,
  isActive: Boolean,
  priority: Number,
  triggerCount: Number,
  successCount: Number,
  failureCount: Number,
  lastTriggered: Date
}
```

### Message Collection
```javascript
{
  userId: ObjectId,
  conversationId: ObjectId,
  instagramMessageId: String,
  content: String,
  direction: String (incoming|outgoing),
  sentiment: String (positive|neutral|negative),
  processedByAI: Boolean,
  replyType: String,
  replyContent: String,
  sentAt: Date,
  createdAt: Date
}
```

### Conversation Collection
```javascript
{
  userId: ObjectId,
  instagramAccountId: ObjectId,
  participantId: String,
  participantUsername: String,
  messageCount: Number,
  automatedReplies: Number,
  manualReplies: Number,
  isPriority: Boolean,
  lastMessageAt: Date,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 API ENDPOINTS

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Rules Engine
- `POST /api/rules` - Create rule
- `GET /api/rules/account/:accountId` - Get account rules
- `PUT /api/rules/:ruleId` - Update rule
- `DELETE /api/rules/:ruleId` - Delete rule
- `PATCH /api/rules/:ruleId/toggle` - Enable/disable rule
- `POST /api/rules/:ruleId/test` - Test rule

### Instagram Integration
- `POST /api/instagram/connect` - Connect account
- `GET /api/instagram/accounts` - Get user accounts
- `DELETE /api/instagram/accounts/:accountId` - Disconnect account
- `GET /api/instagram/accounts/:accountId/conversations` - Get conversations
- `GET /api/instagram/conversations/:conversationId/messages` - Get messages
- `POST /api/instagram/conversations/:conversationId/reply` - Send reply

### Conversations
- `GET /api/conversations` - List conversations
- `GET /api/conversations/:id` - Get conversation with messages
- `PATCH /api/conversations/:id/read` - Mark as read
- `PATCH /api/conversations/:id/priority` - Toggle priority
- `GET /api/conversations/:id/stats` - Get stats

### Billing
- `GET /api/billing/plans` - Get all plans
- `POST /api/billing/checkout` - Create checkout session
- `GET /api/billing/subscription` - Get subscription status
- `GET /api/billing/invoices` - Get billing history
- `POST /api/billing/webhook` - Stripe webhook (public)

### Webhooks
- `GET /api/webhook/instagram` - Meta verification
- `POST /api/webhook/instagram` - Receive messages

---

## 💳 STRIPE INTEGRATION

### Plan Configuration

Free Tier:
- 1 Instagram Account
- 5 Automation Rules
- 100 AI Replies/month
- 1,000 Messages/month

Starter ($29/mo):
- 3 Accounts
- 25 Rules
- 2,000 AI Replies
- 10,000 Messages

Pro ($99/mo):
- 10 Accounts
- 100 Rules
- 20,000 AI Replies
- 100,000 Messages

Agency ($299/mo):
- 50 Accounts
- 500 Rules
- 200,000 AI Replies
- 1,000,000 Messages

### Webhook Events
- `customer.subscription.created` → Activate subscription
- `customer.subscription.updated` → Update limits
- `customer.subscription.deleted` → Downgrade to free
- `invoice.payment_succeeded` → Send confirmation email
- `invoice.payment_failed` → Alert user

---

## 🤖 RULE ENGINE LOGIC

```
Input: Incoming Instagram message
│
├─ Check Active Rules (sorted by priority)
│  │
│  ├─ If keywords match:
│  │  │
│  │  ├─ If replyType === "predefined":
│  │  │  └─ Send predefined message
│  │  │
│  │  ├─ Else if replyType === "ai":
│  │  │  ├─ Call OpenAI API
│  │  │  ├─ Generate contextual reply
│  │  │  └─ Send reply
│  │  │
│  │  └─ Else if replyType === "handoff":
│  │     └─ Email team for manual response
│  │
│  └─ Apply delay if configured
│
├─ Save message to database
├─ Update rule metrics (triggers, success, failures)
├─ Update user usage counters
└─ Update conversation metadata
```

---

## 🔐 META WEBHOOK SETUP

### 1. Create Meta App
- Go to https://developers.facebook.com/apps
- Create new app → Business
- Set name: "AutoDM"

### 2. Configure Instagram Messaging
- In app dashboard, add "Instagram Graph API" product
- Set webhook URL: `https://yourbackend.com/api/webhook/instagram`
- Set verify token: Use `META_VERIFY_TOKEN` from .env

### 3. Subscribe to Webhooks
- In Instagram Product settings:
  - Subscribe to: messages, messaging_postbacks
  - Fields: message, sender, recipient

### 4. Get Access Token
- Instagram Business Account → Settings → Instagram Apps
- Generate page access token
- Set in .env as `META_PAGE_ACCESS_TOKEN`

---

## 🚀 DEPLOYMENT

### Frontend (Vercel)

```bash
cd frontend
npm run build
vercel deploy --prod
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
- `NEXT_PUBLIC_STRIPE_KEY=pk_live_xxx`

### Backend (Render or Fly.io)

**Render:**
```bash
# Create new Web Service
# Connect GitHub repo
# Set environment variables
# Deploy automatically on push
```

**Fly.io:**
```bash
flyctl launch
flyctl deploy
```

### Database (MongoDB Atlas)
- Create cluster at https://mongodb.com/cloud/atlas
- Get connection string
- Add IP whitelist for backend server

### Redis (for Job Queue)
- Option 1: Upstash (serverless Redis)
- Option 2: Self-hosted on Fly.io
- Set `REDIS_URL` in backend .env

---

## 📊 SCALING STRATEGY

### Phase 1: MVP (0-100 users)
- Single backend instance
- MongoDB shared cluster
- Webhook processing on main thread
- Basic rate limiting

### Phase 2: Growth (100-1000 users)
- Load balancer with 2-3 backend instances
- MongoDB dedicated cluster
- Redis for job queue (BullMQ)
- Implement rate limiting per user plan
- Add caching layer (Redis)

### Phase 3: Scale (1000+ users)
- Kubernetes cluster
- Database read replicas
- Message queue (RabbitMQ/Redis)
- CDN for static assets
- Separate webhook processing service
- Analytics and monitoring (Datadog/New Relic)

---

## 🔒 SECURITY CHECKLIST

- [x] JWT token validation on all protected routes
- [x] Password hashing with bcrypt
- [x] HTTPS only in production
- [x] Meta webhook signature verification
- [x] Rate limiting (implement with express-rate-limit)
- [x] CORS configured properly
- [x] Sensitive data in environment variables
- [x] Stripe webhook signature verification
- [x] API key rotation strategy
- [x] GDPR-ready data handling
- [x] Input validation with Joi

### To Implement:
```javascript
// Rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📈 MONITORING & LOGGING

### Logging Setup
```javascript
// Use Winston or Pino for structured logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Error Tracking
- Sentry for error monitoring
- Set SENTRY_DSN in .env

### Performance Monitoring
- New Relic or Datadog
- Track webhook processing time
- Monitor database query performance

---

## 🧪 TESTING

### Backend Tests
```bash
npm test
```

### Frontend Tests
```bash
npm run test
```

### Load Testing
```bash
npm install -g artillery
artillery quick --count 100 --num 1000 http://localhost:5000/health
```

---

## 🚨 PRODUCTION CHECKLIST

Before going live:

- [ ] All environment variables set
- [ ] Database backed up
- [ ] SSL certificate installed
- [ ] Rate limiting enabled
- [ ] Error monitoring (Sentry) active
- [ ] Email notifications configured
- [ ] Stripe webhook secret verified
- [ ] Meta webhook signature verified
- [ ] Frontend build optimized
- [ ] Database indexes created
- [ ] Monitoring dashboards set up
- [ ] Backup strategy in place
- [ ] Terms & Privacy pages created
- [ ] GDPR compliance reviewed
- [ ] Security headers configured

---

## 📞 SUPPORT & TROUBLESHOOTING

### Common Issues

**Webhook not receiving messages**
1. Verify webhook URL is publicly accessible
2. Check Meta verify token matches
3. Ensure Instagram account has proper permissions
4. Check webhook logs in Meta dashboard

**AI replies not generating**
1. Verify OpenAI API key is valid
2. Check usage limits haven't been exceeded
3. Review API error logs in backend
4. Test with simpler prompts

**Database connection fails**
1. Check MongoDB connection string
2. Verify IP whitelist includes backend server
3. Ensure database user has correct permissions
4. Test connection with MongoDB compass

---

## 📚 ADDITIONAL RESOURCES

- [Meta Messaging API Docs](https://developers.facebook.com/docs/instagram-api)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Stripe Integration Guide](https://stripe.com/docs/integration)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Docs](https://docs.mongodb.com)

---

**AutoDM v1.0** | Built for Elite Marketers 🚀
