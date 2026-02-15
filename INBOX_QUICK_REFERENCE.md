# LUMINEX Unified Inbox - Quick Reference

## File Locations

### Backend Files
```
backend/src/
├── services/
│   └── conversationService.js       (400+ lines) - Core service
└── routes/
    └── conversations.js             (450+ lines) - API endpoints
```

### Frontend Files
```
frontend/components/
├── Inbox.tsx                        (300+ lines) - Main container
├── ConversationList.tsx             (400+ lines) - List view
└── ChatDisplay.tsx                  (350+ lines) - Chat view
```

### Documentation
```
root/
├── INBOX_SUMMARY.md                 - This file overview
├── INBOX_IMPLEMENTATION_GUIDE.md    - Technical details
├── INBOX_SETUP_GUIDE.md             - Integration steps
└── INBOX_QUICK_REFERENCE.md         - This file
```

## API Endpoints Quick Reference

### Conversations List
```
GET /api/conversations
  ?accountId=...&page=1&limit=20&filter=all&sortBy=updated
```

### Get Conversation
```
GET /api/conversations/:conversationId
  ?accountId=...&page=1&limit=50
```

### Send Message
```
POST /api/conversations/:conversationId/reply
  { accountId, content }
```

### Automation
```
PATCH /api/conversations/:conversationId/automation
  { accountId, enabled: true/false }
```

### Spam/Priority
```
PATCH /api/conversations/:conversationId/spam
  { accountId, isSpam: true/false }

PATCH /api/conversations/:conversationId/priority
  { accountId, isPriority: true/false }
```

### Tags
```
POST /api/conversations/:conversationId/tags
  { accountId, tags: [array] }

DELETE /api/conversations/:conversationId/tags
  { accountId, tags: [array] }
```

### Archive
```
PATCH /api/conversations/:conversationId/archive
  { accountId }

PATCH /api/conversations/:conversationId/unarchive
  { accountId }
```

### Statistics
```
GET /api/conversations/stats
  ?accountId=...
```

### Search
```
GET /api/conversations/search
  ?accountId=...&q=search_term&limit=10
```

### Recent
```
GET /api/conversations/recent
  ?accountId=...&limit=20
```

## Component Props

### Inbox
```typescript
interface InboxProps {
  onLogout?: () => void;
}
```

### ConversationList
```typescript
interface ConversationListProps {
  accountId: string;
  onSelectConversation?: (conversationId: string) => void;
  selectedConversationId?: string;
}
```

### ChatDisplay
```typescript
interface ChatDisplayProps {
  conversationId: string;
  accountId: string;
  onBack?: () => void;
}
```

## Common Usage Patterns

### Load Inbox
```typescript
import Inbox from '@/components/Inbox';

export default function InboxPage() {
  return <Inbox onLogout={handleLogout} />;
}
```

### Get Conversations
```javascript
const response = await fetch('/api/conversations?accountId=123&filter=unread', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { success, data, pagination } = await response.json();
```

### Send Reply
```javascript
const response = await fetch('/api/conversations/conv123/reply', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` 
  },
  body: JSON.stringify({ accountId: '123', content: 'Hello!' })
});
```

### Toggle Automation
```javascript
const response = await fetch('/api/conversations/conv123/automation', {
  method: 'PATCH',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` 
  },
  body: JSON.stringify({ accountId: '123', enabled: false })
});
```

## Database Models

### Conversation
```javascript
{
  userId: ObjectId,
  instagramAccountId: ObjectId,
  participantId: String,
  participantUsername: String,
  participantProfilePic: String,
  lastMessage: String,
  lastMessageAt: Date,
  unreadCount: Number,
  messageCount: Number,
  automatedReplies: Number,
  manualReplies: Number,
  isPriority: Boolean,
  isSpam: Boolean,
  isActive: Boolean,
  automationEnabled: Boolean,
  tags: [String],
  overallSentiment: String,
  responseTime: Number,
  metadata: Object
}
```

### Message
```javascript
{
  conversationId: ObjectId,
  userId: ObjectId,
  senderId: String,
  senderName: String,
  content: String,              // max 4096
  direction: 'incoming'|'outgoing',
  replyType: 'manual'|'automated'|'ai'|'handoff',
  mediaUrls: [String],
  sentiment: String,
  isRead: Boolean,
  createdAt: Date,
  processedAt: Date,
  metadata: Object
}
```

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/luminex
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Setup Checklist

### Backend
- [ ] Copy conversationService.js to backend/src/services/
- [ ] Copy conversations.js to backend/src/routes/
- [ ] Register routes in main app file
- [ ] Verify Conversation and Message models exist
- [ ] Create database indexes
- [ ] Set environment variables
- [ ] Test API endpoints

### Frontend
- [ ] Copy Inbox.tsx to frontend/components/
- [ ] Copy ConversationList.tsx to frontend/components/
- [ ] Copy ChatDisplay.tsx to frontend/components/
- [ ] Install dependencies (axios, socket.io-client, lucide-react, antd)
- [ ] Import components in your page/layout
- [ ] Set environment variables
- [ ] Test components in browser

## Filters & Sort Options

### Filters
- `all` - Show all conversations
- `unread` - Only unread conversations
- `spam` - Only spam conversations
- `priority` - Only priority conversations

### Sort Options
- `recent` - Newest last message first
- `oldest` - Oldest first
- `unread` - Most unread first
- `updated` - Recently updated first

## Response Types

### Success Response
```javascript
{
  success: true,
  data: { ... },
  message: "Operation successful",
  pagination: {
    page: 1,
    pages: 5,
    limit: 20,
    total: 95
  }
}
```

### Error Response
```javascript
{
  success: false,
  error: "Error description"
}
```

### Message Object
```javascript
{
  _id: ObjectId,
  conversationId: ObjectId,
  senderId: String,
  content: String,
  direction: 'incoming' | 'outgoing',
  replyType: 'manual' | 'automated' | 'ai' | 'handoff',
  sentiment: 'positive' | 'negative' | 'neutral',
  createdAt: Date,
  isRead: Boolean
}
```

### Conversation Object
```javascript
{
  _id: ObjectId,
  participantUsername: String,
  participantProfilePic: String,
  lastMessage: String,
  unreadCount: Number,
  messageCount: Number,
  isPriority: Boolean,
  isSpam: Boolean,
  automationEnabled: Boolean,
  tags: [String],
  overallSentiment: String,
  lastMessageAt: Date
}
```

## Common Errors

| Status | Error | Solution |
|--------|-------|----------|
| 400 | accountId is required | Add accountId to request |
| 401 | Unauthorized | Include valid JWT token |
| 404 | Conversation not found | Verify conversation ID |
| 400 | Message cannot be empty | Check message content |
| 400 | Message is too long | Max 4096 characters |
| 500 | Failed to fetch | Check server/database |

## Performance Tips

1. **Pagination:** Use page/limit parameters
   ```
   GET /api/conversations?page=1&limit=20
   ```

2. **Search:** Debounce at 300ms
   ```javascript
   const [searchQuery, setSearchQuery] = useState('');
   const debouncedSearch = useCallback(
     debounce((q) => handleSearch(q), 300),
     []
   );
   ```

3. **Indexes:** Created automatically on setup
   - userId + accountId
   - lastMessageAt
   - Text search on username + message

4. **Lean Queries:** Used by default for read operations

5. **Lazy Loading:** Messages load on demand

## Testing

### Test GET /api/conversations
```bash
curl -X GET "http://localhost:5000/api/conversations?accountId=123&page=1&limit=20" \
  -H "Authorization: Bearer TOKEN"
```

### Test POST /api/conversations/:id/reply
```bash
curl -X POST "http://localhost:5000/api/conversations/conv123/reply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"accountId":"123","content":"Test message"}'
```

### Test PATCH automation
```bash
curl -X PATCH "http://localhost:5000/api/conversations/conv123/automation" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"accountId":"123","enabled":false}'
```

## Keyboard Shortcuts

### ChatDisplay
- `Enter` - Send message
- `Shift + Enter` - New line

## Mobile Responsiveness

- **xs (< 640px):** Full-screen chat view on selection
- **md (≥ 768px):** Split view (list + chat)
- **lg (≥ 1024px):** Full layout with sidebar

## Dark Mode

Both components support dark mode via Tailwind:
- `dark:` prefix for dark mode styles
- Automatically responds to `prefers-color-scheme`
- Can be toggled via CSS class

## WebSocket Events (Ready to implement)

```javascript
// Client connects
socket.emit('join-conversation', { conversationId, userId })

// New message received
socket.on('message:new', (data) => { ... })

// Conversation updated
socket.on('conversation:updated', (data) => { ... })

// Automation toggled
socket.on('automation:toggled', (data) => { ... })

// Typing indicator
socket.on('user:typing', (data) => { ... })
```

## Rate Limits (Recommended)

```
/api/conversations/*/reply: 30 messages/min per user
/api/conversations: 100 requests/min per user
/api/conversations/search: 60 searches/min per user
```

## Next Steps

1. Read `INBOX_SETUP_GUIDE.md` for detailed integration
2. Copy files to appropriate locations
3. Create database indexes
4. Test API endpoints
5. Test frontend components
6. Deploy to production
7. Monitor logs and metrics
8. Implement WebSocket for real-time

## Support Resources

- **Technical Details:** INBOX_IMPLEMENTATION_GUIDE.md
- **Setup Instructions:** INBOX_SETUP_GUIDE.md
- **Code Comments:** Inline documentation
- **Examples:** Throughout documentation

## Version Info

- **Version:** 1.0.0
- **Status:** Production Ready
- **Last Updated:** 2024
- **Node Version:** 14+
- **React Version:** 18+
- **MongoDB:** 4.4+

---

**Quick Links:**
- [Implementation Guide](./INBOX_IMPLEMENTATION_GUIDE.md)
- [Setup Guide](./INBOX_SETUP_GUIDE.md)
- [Summary](./INBOX_SUMMARY.md)
