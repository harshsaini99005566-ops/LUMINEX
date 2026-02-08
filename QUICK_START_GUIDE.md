# 🚀 QUICK START GUIDE - VEXORA PROJECT

## Prerequisites

- Node.js 18+ installed
- MongoDB connection string configured in `.env`
- Backend `.env` file exists with: `NODE_ENV`, `PORT`, `MONGODB_URI`, `JWT_SECRET`

---

## Starting the Project

### Option 1: Start Both Services (Recommended)

**Terminal 1 - Backend API:**

```bash
cd e:\INSTA AUTOMATION\backend
npm run dev
```

Expected output:

```
✅ Express Server running on port 5001
✅ MongoDB connected successfully
✅ All routes loaded successfully
```

**Terminal 2 - Frontend:**

```bash
cd e:\INSTA AUTOMATION\frontend
npm run dev
```

Expected output:

```
✓ Ready in X.Xs
- Local: http://localhost:3000
```

---

### Option 2: Production Build

**Backend:**

```bash
cd backend
npm run build
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm start
```

---

## Verification

### Check Backend Health

```bash
curl http://localhost:5001/health
```

Response:

```json
{
  "success": true,
  "status": "ok",
  "database": {
    "connected": true,
    "database": "test"
  },
  "server": "running"
}
```

### Check MongoDB Connection

```bash
node backend/scripts/testMongoConnection.js
```

Expected output:

```
Attempting to connect to MongoDB...
MongoDB connection successful
Version: 8.0.18
```

---

## Available Scripts

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm start` - Run production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript check

### Backend

- `npm run dev` - Start with nodemon (auto-reload)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests (if configured)

---

## Environment Variables

### Required in `.env`

```
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb+srv://VEXORA:Harsh-112233@vexora.cjbhhw5.mongodb.net/?appName=VEXORA
JWT_SECRET=dev_jwt_secret
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:5001
```

### Optional (for production)

```
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
```

---

## Common Issues & Solutions

### Issue: Port 5001 already in use

```bash
# Find and kill process on port 5001
taskkill /IM node.exe /F
# Then restart
```

### Issue: MongoDB connection failed

```bash
# Verify credentials in .env
node backend/scripts/testMongoConnection.js
# Check internet connection - MongoDB Atlas requires network access
```

### Issue: Frontend won't start on port 3000

- Backend will automatically use port 3001
- Update API_URL in `.env` if needed
- Check browser console for API connection errors

### Issue: "Cannot find module" errors

```bash
# Reinstall dependencies
rm -r node_modules package-lock.json
npm install
```

---

## Architecture Overview

```
VEXORA
├── Backend (Node.js + Express)
│   ├── Routes (auth, instagram, messages, etc.)
│   ├── Models (User, Conversation, Message, etc.)
│   ├── Middleware (auth, rate limiting, error handling)
│   ├── Services (Meta API, Stripe, webhooks)
│   └── Config (database, env, rules engine)
│
├── Frontend (Next.js + React)
│   ├── Pages (dashboard, analytics, billing, etc.)
│   ├── Components (UI, forms, charts)
│   ├── Lib (API client, stores, utilities)
│   └── Styles (Tailwind CSS, Cyber theme)
│
└── Database (MongoDB)
    ├── Users collection
    ├── InstagramAccounts collection
    ├── Conversations collection
    ├── Messages collection
    └── AutomationRules collection
```

---

## API Endpoints

### Health & Status

- `GET /` - API info
- `GET /health` - Health check

### Authentication

- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Instagram Integration

- `GET /api/instagram` - Get accounts
- `POST /api/instagram` - Add account
- `GET /api/instagram/auth/url` - Get OAuth URL

### Conversations

- `GET /api/conversations` - List conversations
- `GET /api/conversations/:id` - Get conversation
- `PATCH /api/conversations/:id/priority` - Mark as priority

### Messages

- `GET /api/messages` - List messages
- `POST /api/messages/send` - Send message

### Analytics

- `GET /api/analytics/overview` - Overview stats
- `GET /api/analytics/timeline` - Message timeline

---

## Debugging

### View Backend Logs

```bash
# Watch logs in real-time
tail -f backend/logs/combined.log

# View error logs
tail -f backend/logs/error.log
```

### Browser Dev Tools

- Open browser DevTools (F12)
- Check Console tab for frontend errors
- Check Network tab for API failures
- Check Application tab for stored tokens

### MongoDB Data

```bash
# Connect to MongoDB Atlas directly
# Use MongoDB Compass or Studio3T
# Connection string in .env
```

---

## Performance Tips

1. **Frontend Build Optimization**
   - Code splitting is automatic with Next.js
   - CSS is minified in production

2. **Backend Optimization**
   - Enable compression: `ENABLE_COMPRESSION=true`
   - Use caching: `ENABLE_CACHING=true`
   - Adjust pool size: `DB_POOL_SIZE=20`

3. **Database Optimization**
   - Ensure indexes are created
   - Monitor connection pool usage
   - Use aggregation pipelines for complex queries

---

## Security Checklist

- [x] CORS configured for frontend URL
- [x] Rate limiting enabled
- [x] JWT authentication implemented
- [x] Password hashing with bcrypt
- [x] Environment variables for secrets
- [x] Security headers configured
- [ ] HTTPS in production (enable SSL)
- [ ] CSRF protection (add if needed)
- [ ] Input validation (in place)
- [ ] Database backups (configure)

---

## Support & Documentation

- **Backend Code:** `backend/src/`
- **Frontend Code:** `frontend/`
- **Database Schemas:** `backend/src/models/`
- **API Routes:** `backend/src/routes/`
- **Configuration:** `backend/config/`

---

**Last Updated:** January 28, 2026
**Status:** ✅ All Systems Operational
