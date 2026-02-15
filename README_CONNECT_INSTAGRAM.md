# LUMINEX Instagram Connect

Files in this implementation provide a complete Instagram connection flow using Meta OAuth for the LUMINEX SaaS platform.

## Backend Files

### `backend/server.js`
Express server with three main endpoints:
- **`GET /auth/instagram`** - Protected route that redirects user to Meta OAuth dialog
  - Reads user ID from JWT
  - Constructs OAuth URL with required scopes
- **`GET /auth/instagram/callback`** - Meta OAuth callback handler
  - Exchanges authorization code for access token
  - Fetches user's Facebook pages and finds connected Instagram Business account
  - Saves Instagram details to user document
  - Redirects to `/dashboard` on success
- **`GET /api/me`** - Protected route returning authenticated user info

### `backend/models/User.js`
Mongoose User schema with embedded Instagram sub-schema:
```javascript
instagram: {
  connected: Boolean,
  igUserId: String,
  username: String,
  accessToken: String,
  connectedAt: Date
}
```

### `backend/middleware/auth.js`
JWT authentication middleware:
- Reads token from `Authorization: Bearer ...` header or `token` cookie
- Verifies JWT signature
- Attaches user object to `req.user`
- Returns 401 if unauthorized

### `backend/.env.example`
Template for environment variables:
```
MONGODB_URI=...
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
JWT_SECRET=...
META_APP_ID=...
META_APP_SECRET=...
INSTAGRAM_REDIRECT_URI=https://yourdomain.com/auth/instagram/callback
```

### `backend/package.json`
Dependencies: express, mongoose, jsonwebtoken, axios, cors, dotenv, cookie-parser

## Frontend Files

### `frontend/src/pages/ConnectInstagram.jsx`
React page component for `/connect/instagram`:
- Fetches `/api/me` on mount to verify authentication
- Auto-redirects to `/dashboard` if user already connected Instagram
- Auto-redirects to `/login` if not authenticated
- Displays clean, centered UI with:
  - LUMINEX logo
  - Title: "Connect Instagram Account ✨"
  - Subtitle: "Only a few steps away to go Viral!"
  - Info card with Meta verification message and benefits
  - Large gradient button (purple → pink → orange) that initiates OAuth
  - Terms notice
  - Logout link

### `frontend/src/components/LuminexLogo.jsx`
Simple reusable logo component with SVG icon and "LUMINEX" text.

### `frontend/package.json`
Minimal dependencies: react, react-dom, react-scripts, Tailwind CSS (via create-react-app)

## User Flow

1. **Signup/Login** → Backend sets JWT in cookie or returns token
2. **Navigate to `/connect/instagram`** → Frontend calls `/api/me`, shows connect page
3. **Click "Login with Instagram"** → Redirects to `GET /auth/instagram`
4. **Meta OAuth Dialog** → User authorizes LUMINEX app
5. **OAuth Callback** → Backend receives code, exchanges for token, finds IG account, saves to user
6. **Redirect to `/dashboard`** → User is now connected

## Integration Steps

1. **Install dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Configure environment:**
   - Copy `backend/.env.example` to `backend/.env`
   - Set `MONGODB_URI` (local MongoDB or Atlas connection string)
   - Set `META_APP_ID`, `META_APP_SECRET` from Meta Developer Dashboard
   - Set `INSTAGRAM_REDIRECT_URI` to your deployed callback URL (or `http://localhost:4000/auth/instagram/callback` for local dev)
   - Set `JWT_SECRET` to a secure random string
   - Set `CLIENT_ORIGIN` to frontend URL

3. **Create frontend .env.local:**
   ```
   REACT_APP_API_URL=http://localhost:4000
   ```

4. **Connect React Router:**
   - Add route in your React app:
     ```jsx
     <Route path="/connect/instagram" element={<ConnectInstagram />} />
     ```
   - Ensure your main App component wraps routes in a Router

5. **Ensure Tailwind CSS is configured** in your frontend project

6. **Integrate auth middleware** in your existing backend:
   - If you already have routes, import `authMiddleware` and use it on protected endpoints
   - Make sure your login endpoint sets a JWT cookie named `token` or returns it for client storage

7. **Run:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm start
   ```

## Security Notes

- Store `INSTAGRAM_REDIRECT_URI` and `META_APP_SECRET` securely (never commit to repo)
- The access token returned by Meta is short-lived; in production, exchange it for a long-lived token or refresh token
- Consider encrypting stored access tokens at rest
- HTTPS is required for production OAuth redirect URIs
- Use httpOnly cookies for token storage when possible

## Next Steps

- Set up your Meta Developer app and obtain APP_ID and APP_SECRET
- Configure MongoDB connection
- Deploy backend and frontend to production infrastructure
- Update `INSTAGRAM_REDIRECT_URI` to your production domain
- Test the full flow in a staging environment before going live
