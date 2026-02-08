# AutoDM - Quick Start Guide

## 🚀 Start Here (5 minutes)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend (.env)**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/auto-dm
JWT_SECRET=your-secret-key-min-32-chars
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
META_VERIFY_TOKEN=your_verify_token
OPENAI_API_KEY=sk-your-api-key
STRIPE_SECRET_KEY=sk_test_xxx
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_KEY=pk_test_xxx
```

### 3. Run Locally

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm run dev
# http://localhost:3000
```

### 4. Create Test Account

Visit http://localhost:3000
- Sign up with email/password
- You get 7-day free trial automatically
- Free plan: 1 account, 5 rules, 100 AI replies/month

---

## 🔌 Connect Instagram Account

1. Go to Dashboard → Settings (top right)
2. Click "Connect Instagram"
3. Authenticate with Instagram Business Account
4. Accept permissions
5. Account appears in list

> **Note**: For webhook to work in development, use ngrok to expose localhost:
> ```bash
> ngrok http 5000
> # Use https://xxx.ngrok.io as Meta webhook URL
> ```

---

## 📝 Create Your First Rule

1. Dashboard → Rules (left sidebar)
2. Click "+ Create Rule"
3. **Step 1**: Name your rule (e.g., "Welcome Message")
4. **Step 2**: Add keywords (e.g., "hi", "hello", "hey")
5. **Step 3**: Choose reply type:
   - **Predefined**: Static message
   - **AI**: Let GPT-4 generate reply
   - **Handoff**: Send to email for manual reply
6. **Step 4**: Review and create

Rule activates immediately. Keywords are case-insensitive by default.

---

## 🤖 How AI Replies Work

When message matches a keyword and AI is enabled:

1. Message content sent to OpenAI
2. System prompt: "You're a helpful customer service bot"
3. Response max 150 tokens (stays short)
4. Temperature: 0.7 (balanced creativity)
5. Reply sent within 1 second

Cost: ~$0.001 per reply (GPT-3.5 pricing)

---

## 📊 Dashboard Widgets

| Widget | Shows |
|--------|-------|
| **Stats Globe** | Rotating 3D sphere (visual) |
| **Message Stream** | Real-time incoming messages |
| **Rule Matrix** | Active rules overview |
| **API Status** | Connection health |
| **Plan Info** | Current tier & limits |

---

## 💳 Upgrade Plans

**Free → Starter** ($29/month)
- 3 accounts (vs 1)
- 25 rules (vs 5)
- 2,000 AI replies (vs 100)
- 10K messages (vs 1K)

Billing → Upgrade Plan → Choose tier → Stripe checkout

Trial → Upgrade anytime. No refunds once charged.

---

## 🔑 API Keys & Credentials

### Get Meta App Credentials

1. [developers.facebook.com/apps](https://developers.facebook.com/apps)
2. Create app → "Business"
3. Add "Instagram Graph API"
4. App Settings → Copy:
   - App ID → `META_APP_ID`
   - App Secret → `META_APP_SECRET`
5. Generate token → `META_PAGE_ACCESS_TOKEN`

### Get OpenAI API Key

1. [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create new secret key
3. Copy → `OPENAI_API_KEY`

### Get Stripe Keys

1. [stripe.com/dashboard](https://stripe.com/dashboard)
2. Go to API keys
3. Copy test secret key → `STRIPE_SECRET_KEY`
4. Copy test publishable → `NEXT_PUBLIC_STRIPE_KEY`

---

## 🧪 Test Message Flow

### Using Postman

**Send test message:**
```
POST http://localhost:5000/api/webhook/instagram
Header: x-hub-signature-256: (generate using app secret)
Body:
{
  "object": "instagram",
  "entry": [{
    "messaging": [{
      "sender": { "id": "123456" },
      "recipient": { "id": "654321" },
      "message": { "text": "hello", "mid": "msg123" },
      "timestamp": 1704020000000
    }]
  }]
}
```

### In Database

Check MongoDB:
1. Message saved in `messages` collection
2. Conversation created/updated in `conversations`
3. If rule matched: reply sent to Instagram
4. Metrics updated in `automationrules`

---

## ⚡ Performance Tips

### Frontend
- Images lazy-loaded by Next.js
- Three.js globe: disabled on mobile (performance)
- Animations use `will-change` CSS

### Backend
- Database queries use indexes
- JWT cached in memory (no DB hits per request)
- Rules sorted by priority (fast-path for common cases)
- Webhook processing async (non-blocking)

### Scaling
- Add Redis for session caching
- Use BullMQ for message queue
- Deploy multiple backend instances behind load balancer
- MongoDB read replicas for analytics queries

---

## 🐛 Common Issues

### "MongoDB connection failed"
- Check connection string in .env
- Verify IP whitelist in MongoDB Atlas
- Ensure user has readWrite access

### "Webhook not receiving messages"
- Verify webhook URL publicly accessible
- Check Meta verify token matches
- Instagram account must be business account
- Must have proper permissions

### "AI replies not generating"
- Check OpenAI API key valid
- Verify account has credits
- Check usage hasn't exceeded rate limits
- Review API error logs: `backend/logs/error.log`

### "Stripe checkout not working"
- Use Stripe test card: `4242 4242 4242 4242`
- Expiry: any future date
- CVC: any 3 digits
- Ensure `NEXT_PUBLIC_STRIPE_KEY` is in frontend .env.local

---

## 📚 Learning Resources

- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [OpenAI Chat Completions](https://platform.openai.com/docs/guides/gpt)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Next.js Best Practices](https://nextjs.org/learn)
- [Express.js Guide](https://expressjs.com/)

---

## 🚀 Next Steps

1. ✅ Set up local environment
2. ✅ Connect Instagram account
3. ✅ Create 2-3 test rules
4. ✅ Send test messages to verify
5. ✅ Deploy to production (see DEPLOYMENT_GUIDE.md)
6. ✅ Set up monitoring & alerts
7. ✅ Launch to customers

---

## 💬 Support

For questions or issues:
- Check DEPLOYMENT_GUIDE.md for production setup
- Review ARCHITECTURE.md for system design
- Check backend logs: `npm run dev` output
- Enable debug mode in Next.js

---

**AutoDM v1.0** | Production-Ready SaaS Foundation
