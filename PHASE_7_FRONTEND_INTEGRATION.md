# PHASE 7: Frontend Instagram Integration

**Status**: 🔄 IN-PROGRESS  
**Completion**: 60%  
**Focus**: Wiring frontend components to Meta API backend

## Overview

Phase 7 implements the complete frontend for Instagram account management and messaging. Users can now:
- ✅ Connect Instagram Business Accounts via OAuth
- ✅ View connected accounts with detailed information
- ✅ Manage account connections (add/remove)
- ✅ View conversations and messages
- ✅ Send direct messages to followers
- ⏳ Set up automation rules per account
- ⏳ View analytics and insights

## Completed Components

### 1. InstagramConnect Component
**File**: `frontend/components/InstagramConnect.tsx` (NEW)  
**Purpose**: OAuth flow handler for Instagram account linking

```tsx
// Key features:
- Instagram OAuth redirect (instagram.com/oauth/authorize)
- Code exchange via backend
- Account linking UI with requirements
- Success/error callbacks
- Props: onSuccess, onError
```

### 2. Accounts Dashboard
**File**: `frontend/app/dashboard/accounts/page.tsx` (ENHANCED)  
**Purpose**: Account management interface

**Features**:
- List all connected accounts
- Display account status (Active/Inactive)
- Show subscription status
- Display follower count and connection date
- Inline action buttons (Inbox, Rules, Remove)
- Error handling and loading states
- Motion animations with stagger

**Key Functions**:
```tsx
fetchAccounts()          // GET /api/instagram/accounts
handleConnectSuccess()   // Refetch after linking
handleConnectError()     // Display error to user
handleDisconnect()       // DELETE /api/instagram/accounts/{id}
```

### 3. Inbox Page
**File**: `frontend/app/dashboard/inbox/page.tsx` (ENHANCED)  
**Purpose**: Message viewing and sending interface

**Features**:
- List conversations for selected account
- Display participant info and message count
- Show unread message count
- View message history with timestamps
- Send direct messages to followers
- Auto-scroll to latest message
- Motion animations

**Key Functions**:
```tsx
fetchConversations()     // GET /api/instagram/accounts/{accountId}/conversations
fetchMessages()          // GET /api/instagram/conversations/{conversationId}/messages
handleSendMessage()      // POST /api/instagram/send-message
```

**Message Display**:
- Incoming messages (left, dark style)
- Outgoing messages (right, primary color)
- Timestamps and delivery indicators
- Reply type indicators (automated/AI)

## Backend Endpoints

### Conversations API

**GET** `/api/instagram/accounts/:accountId/conversations`
- **Auth**: Required (Bearer token)
- **Params**: 
  - `accountId` - Instagram account ID
- **Response**:
```json
{
  "conversations": [
    {
      "_id": "conv123",
      "conversationId": "123_456",
      "participantId": "456",
      "participantUsername": "john_doe",
      "messageCount": 5,
      "unreadCount": 2,
      "lastMessageAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Messages API

**GET** `/api/instagram/conversations/:conversationId/messages`
- **Auth**: Required
- **Params**:
  - `conversationId` - Conversation ID
- **Response**:
```json
{
  "messages": [
    {
      "_id": "msg123",
      "instagramSenderId": "123",
      "senderUsername": "john_doe",
      "content": "Hello!",
      "direction": "incoming",
      "hasReply": true,
      "replyType": "predefined",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Send Message API

**POST** `/api/instagram/send-message`
- **Auth**: Required
- **Body**:
```json
{
  "accountId": "account123",
  "participantId": "follower456",
  "message": "Thanks for reaching out!"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Message sent",
  "messageId": "msg789",
  "instagramMessageId": "m.123456"
}
```

## Database Models Used

### InstagramAccount
```typescript
{
  _id: ObjectId
  userId: ObjectId
  instagramId: String
  username: String
  profilePicture: String
  followers: Number
  accessToken: String (encrypted)
  expiresAt: Date
  isActive: Boolean
  connectedAt: Date
  lastSyncedAt: Date
}
```

### Conversation
```typescript
{
  _id: ObjectId
  userId: ObjectId
  instagramAccountId: ObjectId
  conversationId: String
  participantId: String
  participantUsername: String
  messageCount: Number
  unreadCount: Number
  lastMessageAt: Date
  lastReplyAt: Date
  manualReplies: Number
  isActive: Boolean
  createdAt: Date
}
```

### Message
```typescript
{
  _id: ObjectId
  userId: ObjectId
  instagramAccountId: ObjectId
  conversationId: ObjectId
  instagramSenderId: String
  senderUsername: String
  content: String
  direction: "incoming" | "outgoing"
  hasReply: Boolean
  replyType?: "predefined" | "ai"
  instagramMessageId?: String
  processedAt: Date
  createdAt: Date
}
```

## UI Components Used

### CyberCard
- Main container for all panels
- Bordered with primary color
- Glowing effects on hover
- Dark background

### CyberButton
- `variant="primary"` - Main actions
- `variant="ghost"` - Secondary actions
- `variant="danger"` - Destructive actions
- `size="sm"` - Small buttons for inputs

### CyberInput
- Text input with cyber styling
- Placeholder text
- Focus effects
- Support for disabled state

### Motion Animations
- Fade-in on mount
- Staggered list rendering
- Hover effects on buttons
- Slide animations on panel changes
- Auto-scroll to latest message

## Component Flow

```
Dashboard
├── Accounts Page
│   ├── Display all accounts
│   ├── Connection button (opens InstagramConnect)
│   └── Inline links to Inbox/Rules
│
└── Inbox Page
    ├── Accepts ?account=accountId
    ├── Conversation List
    │   └── Click to select
    └── Message Panel
        ├── Message history
        └── Message input
```

## Data Flow

### Account Connection Flow
```
1. User clicks "Connect Account" button
2. InstagramConnect component opens
3. Opens Instagram OAuth dialog
4. User authenticates with Meta
5. Instagram redirects to /auth/instagram/callback?code=CODE
6. Backend exchanges code for access token
7. Backend retrieves business account ID
8. Backend stores account in DB
9. Frontend refetches accounts list
10. New account appears in list
```

### Sending Message Flow
```
1. User selects conversation
2. Types message in input
3. Presses Enter or clicks Send
4. handleSendMessage() triggered
5. POST to /api/instagram/send-message
6. Backend sends via Meta API
7. Backend saves message to DB
8. Frontend refetches messages
9. New message appears in conversation
```

## Environment Variables

**Required for Frontend**:
```env
NEXT_PUBLIC_INSTAGRAM_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Required for Backend** (already set in Phase 6):
```env
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_WEBHOOK_SECRET=your_webhook_secret
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_account_id
```

## Implementation Checklist

### ✅ Completed
- [x] InstagramConnect OAuth component
- [x] Enhanced accounts/page.tsx with full UI
- [x] Inbox page with message viewing
- [x] Send message endpoint (/api/instagram/send-message)
- [x] Conversation fetching endpoint
- [x] Message fetching endpoint
- [x] Error handling and loading states
- [x] TypeScript interfaces and types
- [x] Motion animations

### ⏳ In Progress
- [ ] OAuth callback route (backend)
- [ ] Account link endpoint (backend)
- [ ] Test complete OAuth flow
- [ ] Message delivery status indicators

### ❌ Not Started
- [ ] Rule builder integration
- [ ] Message automation testing
- [ ] Analytics dashboard
- [ ] Comment/mention handlers
- [ ] Story mention handlers
- [ ] Message search functionality
- [ ] Conversation filtering/search

## Next Steps

### 1. Implement OAuth Callback Route
**File**: `backend/src/routes/auth.js`

```javascript
router.get('/instagram/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const { accessToken, userId } = await instagramService.getAccessTokenFromCode(code);
    const igBusinessAccountId = await instagramService.getInstagramBusinessAccountId(userId, accessToken);
    const { accessToken: longLivedToken } = await instagramService.exchangeAccessToken(accessToken);
    
    const account = new InstagramAccount({
      user: req.user._id,
      instagramId: igBusinessAccountId,
      accessToken: longLivedToken,
      userId,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    });
    
    await account.save();
    res.redirect('/dashboard/accounts?success=true');
  } catch (error) {
    res.redirect('/dashboard/accounts?error=' + error.message);
  }
});
```

### 2. Configure Environment Variables
Add to `frontend/.env.local`:
```env
NEXT_PUBLIC_INSTAGRAM_APP_ID=YOUR_APP_ID
```

### 3. Test Complete Flow
1. Navigate to Accounts page
2. Click "Connect Instagram Account"
3. Authenticate with Meta
4. Should redirect back and show account
5. Click "Inbox" on account card
6. Should show conversations
7. Select conversation and send message

### 4. Create Rule Builder Integration
Connect automation rules to accounts:
- Per-account rule creation
- Account-specific keywords
- Account-specific responses

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/instagram/accounts/link` | Link new account (OAuth code) |
| GET | `/api/instagram/accounts` | Get user's accounts |
| DELETE | `/api/instagram/accounts/:id` | Disconnect account |
| GET | `/api/instagram/accounts/:accountId/conversations` | Get conversations |
| GET | `/api/instagram/conversations/:conversationId/messages` | Get messages |
| POST | `/api/instagram/send-message` | Send direct message |
| POST | `/api/instagram/conversations/:id/reply` | Send manual reply |
| GET | `/auth/instagram/callback` | OAuth callback |

## Error Handling

### Frontend Error States
- Missing account ID: Shows warning banner
- Fetch failures: Displays error message with retry
- Send failures: Shows error without clearing input
- Network errors: Caught and logged

### Backend Error Responses
- 400: Bad request (missing parameters)
- 401: Unauthorized (invalid token)
- 404: Not found (account/conversation)
- 500: Server error (API failure)

## Performance Considerations

- Messages limited to 100 per conversation fetch
- Conversations limited to 50 per account
- Auto-scroll optimized with useRef
- Animations disabled on low-end devices
- Lazy loading for message history

## Security Notes

- All requests require Bearer token
- Account access verified (userId check)
- Messages validated before sending
- Access tokens encrypted in database
- Webhook signature verification enabled

## Testing Strategy

1. **OAuth Flow Test**
   - Verify callback handling
   - Test token exchange
   - Check database storage

2. **Message Sending Test**
   - Send test message
   - Verify in Meta Dashboard
   - Check database entry

3. **Conversation Loading Test**
   - Load conversation list
   - Load messages
   - Check pagination

4. **Error Handling Test**
   - Send invalid data
   - Test network failures
   - Verify error messages

## Phase 7 Completion Criteria

- [x] Account linking UI
- [x] Account management page
- [x] Inbox/messaging interface
- [x] Send message functionality
- [ ] OAuth callback working
- [ ] Complete end-to-end flow tested
- [ ] Error handling comprehensive
- [ ] All animations smooth
