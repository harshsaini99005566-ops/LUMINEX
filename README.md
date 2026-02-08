# AutoDM SaaS - Instagram DM & Comment Automation Platform

> **Production-grade SaaS for automating Instagram DMs and comments with AI-powered replies, keyword-based rules, and a cyberpunk mission control UI.**

![AutoDM](https://img.shields.io/badge/Status-Production%20Ready-success) ![Node](https://img.shields.io/badge/Node-18%2B-blue) ![React](https://img.shields.io/badge/React-18-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green) ![License](https://img.shields.io/badge/License-MIT-blue)

---

## 🎯 What is AutoDM?

AutoDM is an enterprise-grade SaaS platform that helps Instagram creators, agencies, and marketers automate their direct messages and comment replies. It's similar to LinkPlease or ManyChat, but specifically designed for DM automation with AI-powered fallback.

### Core Capabilities

✅ **Auto DM Replies** - Respond to direct messages automatically  
✅ **Auto Comment Replies** - Reply to comments on posts  
✅ **Keyword-Based Rules** - Match keywords, regex patterns  
✅ **AI Fallback** - GPT-4 generates contextual replies  
✅ **Human Handoff** - Route complex conversations to team  
✅ **Multi-Account** - Manage unlimited Instagram accounts  
✅ **Real-Time Dashboard** - Live message feed, rule metrics  
✅ **Flexible Plans** - Free → Agency tiers with Stripe  

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion + GSAP
- **3D**: Three.js (lightweight visualization)
- **State**: Zustand
- **UI Theme**: Cyberpunk (neon + glass morphism)

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB (Atlas)
- **Auth**: JWT (jsonwebtoken)
- **Payments**: Stripe
- **AI**: OpenAI API (GPT-4)
- **Instagram**: Meta Messaging API
- **Queue**: BullMQ (Redis)

### Hosting
- **Frontend**: Vercel
- **Backend**: Render or Fly.io
- **Database**: MongoDB Atlas
- **Cache**: Upstash (Redis)

---

## 📁 Project Structure

```
AUTO DM 2/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── server.js          # Main entry point
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── models/            # MongoDB schemas
│   │   └── middleware/        # Auth, error handling
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── frontend/                   # Next.js + React app
│   ├── app/                   # Pages & layouts
│   ├── components/            # Reusable components
│   ├── lib/                   # Utilities & API client
│   ├── public/                # Static assets
│   ├── package.json
│   └── tailwind.config.ts
│
├── QUICKSTART.md              # Get running in 5 min
├── DEPLOYMENT_GUIDE.md        # Production setup
├── ARCHITECTURE.md            # System design
└── README.md                  # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier OK)
- Stripe account (test mode)
- OpenAI API key
- Meta/Instagram Graph API credentials

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials

# Frontend
cd frontend
npm install
```

### 2. Start Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Server: http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm run dev
# App: http://localhost:3000
```

### 3. Create Account

Visit http://localhost:3000:
1. Sign up
2. Get 7-day free trial
3. Free tier: 1 account, 5 rules, 100 AI replies/month

### 4. Connect Instagram

- Dashboard → Settings
- Click "Connect Instagram"
- Authenticate with business account
- Start creating rules!

**👉 Full setup guide: [QUICKSTART.md](QUICKSTART.md)**

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](QUICKSTART.md) | Get running in 5 minutes |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Production deployment |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design & flows |
| [PHASE_5_SUMMARY.md](PHASE_5_SUMMARY.md) | Cyberpunk UI enhancements |
| [PHASE_5_CYBERPUNK.md](PHASE_5_CYBERPUNK.md) | Animation & effect details |

---

## 🎨 Design System (Cyberpunk Mission Control)

### Color Palette
- **Primary**: `#00FF88` (neon green)
- **Secondary**: `#7700FF` (purple)
- **Dark BG**: `#0A0A14`
- **Card BG**: `#131320`
- **Accent 1**: `#00D1FF` (cyan)
- **Accent 2**: `#FF2A6D` (magenta)
- **Text**: `#E2E8F0` (light gray)

### Visual Elements
- Floating glass panels with blur effect
- Neon glow on interactive elements
- Animated grid background
- Cyberpunk typography (monospace)
- 3D visualizations (Three.js globe)
- Smooth animations (Framer Motion)

---

## 💳 Business Model

### Plans

| Plan | Price | Accounts | Rules | AI Replies/mo | Messages/mo |
|------|-------|----------|-------|---------------|-------------|
| **Free** | $0 | 1 | 5 | 100 | 1,000 |
| **Starter** | $29 | 3 | 25 | 2,000 | 10,000 |
| **Pro** | $99 | 10 | 100 | 20,000 | 100,000 |
| **Agency** | $299 | 50 | 500 | 200,000 | 1,000,000 |

### Features by Plan
- ✅ All plans: Keyword matching, predefined replies
- ✅ Starter+: AI reply generation, 3 accounts
- ✅ Pro+: 10 accounts, 100 rules
- ✅ Agency: Unlimited potential, priority support

---

## 🔧 API Overview

### Authentication
```
POST   /api/auth/register        Create account
POST   /api/auth/login           Login
POST   /api/auth/refresh         Refresh token
GET    /api/auth/me              Get current user
```

### Rules Engine
```
POST   /api/rules                Create rule
GET    /api/rules/account/:id    Get rules
PUT    /api/rules/:id            Update rule
DELETE /api/rules/:id            Delete rule
POST   /api/rules/:id/test       Test rule
```

### Instagram Integration
```
POST   /api/instagram/connect    Connect account
GET    /api/instagram/accounts   Get accounts
GET    /api/instagram/accounts/:id/conversations
POST   /api/instagram/conversations/:id/reply
```

### Webhooks (Public)
```
GET    /api/webhook/instagram    Meta verification
POST   /api/webhook/instagram    Receive messages
POST   /api/billing/webhook      Stripe events
```

**Full API docs in [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md#-api-endpoints)**

---

## 🤖 Rule Engine Logic

```
Message arrives → Check active rules (by priority)
  ├─ Keyword match? 
  │  ├─ YES → Check reply type
  │  │        ├─ Predefined? → Send static message
  │  │        ├─ AI? → Call OpenAI → Send dynamic reply
  │  │        └─ Handoff? → Email team
  │  │
  │  └─ NO → Log & skip
  │
  └─ Save message → Update metrics → Done
```

**No match**: Message logged, awaits human reply  
**Match found**: Automatic reply sent within 1-3 seconds  
**AI enabled**: ~$0.001 cost per GPT-4 reply

---

## 🔐 Security Features

- ✅ JWT token authentication
- ✅ Password hashing (bcrypt)
- ✅ HTTPS only in production
- ✅ Meta webhook signature verification
- ✅ Stripe webhook signature verification
- ✅ Rate limiting per user plan
- ✅ CORS configured
- ✅ Environment variables for secrets
- ✅ API key rotation strategy
- ✅ GDPR-ready data handling

**See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md#-security-checklist) for full checklist**

---

## 📈 Scaling Architecture

### Phase 1: MVP (0-100 users)
- Single backend instance
- Shared MongoDB tier
- Webhook on main thread

### Phase 2: Growth (100-1000 users)
- 2-3 backend instances + load balancer
- Dedicated MongoDB cluster
- Redis queue (BullMQ)
- Caching layer

### Phase 3: Enterprise (1000+ users)
- Kubernetes cluster
- Database read replicas
- Separate webhook processor
- CDN for static assets
- Analytics pipeline (Datadog/New Relic)

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel deploy --prod
```

### Backend (Render)
```bash
# Connect GitHub repo
# Set environment variables
# Auto-deploys on push
```

### Database (MongoDB Atlas)
- Create cluster
- Whitelist IP addresses
- Enable backups

**Full guide: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md#-deployment)**

---

## 🧪 Testing

### Test Message Flow
1. Create rule with keyword "hello"
2. Send test message via Postman/API
3. Check MongoDB for saved message
4. Verify reply sent to Instagram
5. Check rule metrics updated

### Load Testing
```bash
artillery quick --count 100 --num 1000 http://localhost:5000/health
```

---

## 📊 Monitoring

### What to Monitor
- Message processing latency
- Rule matching success rate
- AI API response time
- Database query performance
- Webhook processing time
- Stripe webhook delivery

### Tools
- **Error Tracking**: Sentry
- **Performance**: New Relic or Datadog
- **Logs**: Winston/Pino
- **Metrics**: Custom dashboards

---

## 🐛 Troubleshooting

### "Instagram webhook not receiving messages"
1. Verify webhook URL is publicly accessible
2. Check Meta verify token matches
3. Ensure account has business status
4. Check Meta webhook logs

### "AI replies not working"
1. Verify OpenAI API key valid
2. Check account has credits
3. Review error logs
4. Test with different keywords

### "Database connection failed"
1. Check MongoDB URI in .env
2. Verify IP whitelist includes backend
3. Ensure user has readWrite permission

**More help: [QUICKSTART.md](QUICKSTART.md#-common-issues)**

---

## 📝 License

MIT - Build what you want with this code

---

## 🤝 Contributing

Contributions welcome! Areas to help:

- [ ] Add email notifications
- [ ] Implement sentiment analysis
- [ ] Add multi-language support
- [ ] Build analytics dashboard
- [ ] Create mobile app
- [ ] Add rate limiting UI
- [ ] Implement conversation tagging
- [ ] Build team collaboration features

---

## 📞 Support

- 📖 [Full Documentation](./DEPLOYMENT_GUIDE.md)
- 🏗️ [System Architecture](./ARCHITECTURE.md)
- ⚡ [Quick Start](./QUICKSTART.md)
- 🐛 [Issues & Troubleshooting](./QUICKSTART.md#-common-issues)

---

## 🎯 Roadmap

**v1.0** (Current)
- ✅ Auto DM/comment replies
- ✅ Keyword rules
- ✅ AI fallback
- ✅ Multi-account
- ✅ Stripe billing

**v1.1** (Planned)
- [ ] Email notifications
- [ ] Conversation analytics
- [ ] Team collaboration
- [ ] Advanced scheduling
- [ ] Sentiment analysis

**v2.0** (Future)
- [ ] Mobile app
- [ ] TikTok/YouTube integration
- [ ] Advanced analytics
- [ ] Custom AI training
- [ ] Enterprise SSO

---

## 💰 Revenue Model

**SaaS Subscription**
- Free tier (limited)
- Starter $29/mo (3 accounts)
- Pro $99/mo (10 accounts)
- Agency $299/mo (50 accounts)

**Additional Revenue** (future)
- Add-ons: Advanced analytics ($19/mo)
- Premium support
- White-label licensing
- Affiliate program (10% commission)

**Target Revenue** (Year 1)
- 100 paid users = $100K ARR

---

## 🏆 Why AutoDM?

**For Creators**: Respond to every DM without hiring staff  
**For Agencies**: Scale client management across multiple accounts  
**For Marketers**: Instant customer engagement at scale  

Save hours every day. Convert more followers to customers. Never miss a message.

---

**Built with 🔥 for elite marketers. Mission Control style.**

v1.0 | January 2024
