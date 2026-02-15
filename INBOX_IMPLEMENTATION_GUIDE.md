# LUMINEX Unified Inbox - Complete Implementation Guide

## Overview

The LUMINEX Unified Inbox is a complete Instagram conversation management system that provides real-time message handling, automation control, and intelligent conversation management. This system integrates with the rule-based automation engine to provide comprehensive inbox automation.

## Architecture

### Backend Components

#### 1. **ConversationService** (`backend/src/services/conversationService.js`)
Core service handling all conversation and message operations.

**Key Methods:**

```javascript
// Retrieve conversations with filtering and pagination
getConversations(userId, accountId, options)
- Options: { page, limit, search, filter, sortBy }
- Filters: 'all', 'unread', 'spam', 'priority'
- Returns: { success, data, pagination }

// Get single conversation with message history
getConversationWithMessages(userId, accountId, conversationId, messageOptions)
- Returns: { success, conversation, messages, pagination }

// Send manual reply
sendManualReply(userId, accountId, conversationId, messageText, metadata)
- Validates message length (max 4096 chars)
- Creates Message record with replyType: 'manual'
- Emits WebSocket event for real-time updates
- Returns: { success, message }

// Toggle automation for conversation
toggleAutomation(userId, accountId, conversationId, enabled)
- Enable/disable automation rule execution
- Updates conversation.automationEnabled
- Emits state change event
- Returns: { success, automationEnabled }

// Mark conversation as spam/priority/tag
markAsSpam/Priority/addTags/removeTags(userId, accountId, conversationId, ...)
- Updates conversation metadata
- Emits update events
- Returns: { success, data }

// Archive/unarchive conversations
archiveConversation/unarchiveConversation(userId, accountId, conversationId)
- Soft delete (sets isActive: false)
- Returns: { success }

// Get statistics
getConversationStats(userId, accountId)
- Total conversations, unread count, automation rate
- Returns: { success, data: { totalConversations, unreadCount, ... } }

// Search conversations
searchConversations(userId, accountId, query, limit)
- Full-text search with regex fallback
- Returns: { success, data: [...conversations] }

// Get recent conversations
getRecentConversations(userId, accountId, limit)
- Get active conversations from last 7 days
- Returns: { success, data: [...conversations] }
```

#### 2. **API Routes** (`backend/src/routes/conversations.js`)
RESTful endpoints wrapping ConversationService.

**Available Endpoints:**

```
GET  /api/conversations
  Query: accountId, page, limit, search, filter, sortBy
  Response: { success, data, pagination }

GET  /api/conversations/recent
  Query: accountId, limit
  Response: { success, data }

GET  /api/conversations/stats
  Query: accountId
  Response: { success, data: { totalConversations, ... } }

GET  /api/conversations/search
  Query: accountId, q, limit
  Response: { success, data }

GET  /api/conversations/:conversationId
  Query: accountId, page, limit
  Response: { success, conversation, messages, pagination }

POST /api/conversations/:conversationId/reply
  Body: { accountId, content }
  Response: { success, message: 'Reply sent...', data }

PATCH /api/conversations/:conversationId/automation
  Body: { accountId, enabled }
  Response: { success, automationEnabled }

PATCH /api/conversations/:conversationId/spam
  Body: { accountId, isSpam }
  Response: { success, isSpam }

PATCH /api/conversations/:conversationId/priority
  Body: { accountId, isPriority }
  Response: { success, isPriority }

POST /api/conversations/:conversationId/tags
  Body: { accountId, tags: [...] }
  Response: { success, tags }

DELETE /api/conversations/:conversationId/tags
  Body: { accountId, tags: [...] }
  Response: { success, tags }

PATCH /api/conversations/:conversationId/archive
  Body: { accountId }
  Response: { success }

PATCH /api/conversations/:conversationId/unarchive
  Body: { accountId }
  Response: { success }
```

### Frontend Components

#### 1. **Inbox Component** (`frontend/components/Inbox.tsx`)
Main container component managing account selection and layout.

**Features:**
- Account selector dropdown
- Statistics dashboard (toggle)
- Responsive layout (mobile/desktop)
- Navigation bar with actions
- Top-level state management

**Props:**
```typescript
interface InboxProps {
  onLogout?: () => void;
}
```

#### 2. **ConversationList Component** (`frontend/components/ConversationList.tsx`)
Displays paginated list of conversations with filters and search.

**Features:**
- Real-time conversation list
- Search with debounce
- Filter tabs: All, Unread, Spam, Priority
- Quick actions menu (mark spam, priority, archive)
- Unread badges
- Conversation status indicators
- Pagination support
- Sentiment indicators
- Tag display

**Props:**
```typescript
interface ConversationListProps {
  accountId: string;
  onSelectConversation?: (conversationId: string) => void;
  selectedConversationId?: string;
}
```

#### 3. **ChatDisplay Component** (`frontend/components/ChatDisplay.tsx`)
Shows message history and message composition interface.

**Features:**
- Message history with pagination
- Incoming/outgoing message distinction
- Automated vs manual message badges
- Sentiment badges (incoming messages)
- Message timestamps
- Read receipts
- Automation toggle button
- Message composition with:
  - Text input with character counter
  - Emoji support
  - File attachment button
  - Shift+Enter for new lines
  - Auto-scroll to latest message
- Conversation header with details
- Context menu with actions

**Props:**
```typescript
interface ChatDisplayProps {
  conversationId: string;
  accountId: string;
  onBack?: () => void;
}
```

## Database Schema

### Conversation Model

```javascript
{
  userId: ObjectId,                    // User who owns conversation
  instagramAccountId: ObjectId,        // Instagram account
  participantId: String,               // Instagram user ID
  participantUsername: String,         // Instagram username
  participantProfilePic: String,       // Profile picture URL
  lastMessage: String,                 // Last message preview
  lastMessageAt: Date,                 // Timestamp of last message
  createdAt: Date,                     // First message timestamp
  updatedAt: Date,
  unreadCount: Number,                 // Unread message count
  messageCount: Number,                // Total messages
  automatedReplies: Number,            // Count of automated replies
  manualReplies: Number,               // Count of manual replies
  isPriority: Boolean,                 // Priority conversation flag
  isSpam: Boolean,                     // Spam flag
  isActive: Boolean,                   // Not archived
  automationEnabled: Boolean,          // Automation rule execution enabled
  tags: [String],                      // Custom tags
  overallSentiment: String,            // 'positive', 'negative', 'neutral'
  responseTime: Number,                // Avg response time in seconds
  metadata: {
    firstResponseTime: Number,
    totalInteractions: Number,
    lastAutomatedReplyAt: Date
  }
}
```

### Message Model

```javascript
{
  conversationId: ObjectId,            // Linked conversation
  userId: ObjectId,                    // Message owner
  senderId: String,                    // Instagram user ID
  senderName: String,                  // Sender username
  content: String,                     // Message text (max 4096 chars)
  direction: 'incoming' | 'outgoing',
  replyType: 'manual' | 'automated' | 'ai' | 'handoff',
  mediaUrls: [String],                 // Media attachments
  sentiment: String,                   // 'positive', 'negative', 'neutral'
  isRead: Boolean,
  createdAt: Date,
  processedAt: Date,                   // When automation processed it
  metadata: {
    ruleId: ObjectId,                  // Which automation rule triggered
    characterCount: Number,
    language: String,
    hasMedia: Boolean
  }
}
```

## Integration Points

### With Rule Engine

```javascript
// When conversation receives incoming message
ConversationService.onIncomingMessage(conversationId) {
  if (conversation.automationEnabled) {
    // Trigger AutomationRuleEngine
    AutomationRuleEngine.processMessage(message);
    
    // Create automated reply
    conversationService.sendManualReply(
      userId, accountId, conversationId,
      automatedReplyContent,
      { replyType: 'automated', ruleId: matchedRule._id }
    );
  }
}
```

### WebSocket Events (Real-time)

```javascript
// Server emits
socket.emit('message:new', { conversationId, message });
socket.emit('conversation:updated', { conversationId, conversation });
socket.emit('automation:toggled', { conversationId, enabled });
socket.emit('conversation:spam-marked', { conversationId, isSpam });
socket.emit('conversation:priority-marked', { conversationId, isPriority });
socket.emit('conversation:archived', { conversationId });

// Client listens
socket.on('message:new', (data) => {
  // Update messages and scroll
});

socket.on('automation:toggled', (data) => {
  // Update automation status UI
});
```

## Usage Examples

### Backend Usage

```javascript
// In your automation processing logic
const conversationService = require('../services/conversationService');

// Get all conversations for account
const result = await conversationService.getConversations(userId, accountId, {
  page: 1,
  limit: 20,
  filter: 'unread',
  sortBy: 'updated'
});

// Send automated reply
await conversationService.sendManualReply(
  userId,
  accountId,
  conversationId,
  'Thanks for your message! We\'ll get back to you soon.',
  { replyType: 'automated', ruleId: rule._id }
);

// Get conversation details
const { conversation, messages } = await conversationService
  .getConversationWithMessages(userId, accountId, conversationId);

// Toggle automation
await conversationService.toggleAutomation(userId, accountId, conversationId, false);
```

### Frontend Usage

```typescript
import Inbox from '@/components/Inbox';

export default function InboxPage() {
  const handleLogout = () => {
    // Handle logout
  };

  return (
    <Inbox onLogout={handleLogout} />
  );
}
```

```typescript
// Using individual components
import ConversationList from '@/components/ConversationList';
import ChatDisplay from '@/components/ChatDisplay';

export default function CustomInbox() {
  const [selectedId, setSelectedId] = useState('');

  return (
    <div className="flex h-screen">
      <ConversationList
        accountId="account123"
        onSelectConversation={setSelectedId}
        selectedConversationId={selectedId}
      />
      {selectedId && (
        <ChatDisplay
          conversationId={selectedId}
          accountId="account123"
        />
      )}
    </div>
  );
}
```

## Features in Detail

### 1. **Conversation Filtering**

- **All**: Show all conversations
- **Unread**: Only conversations with unread_count > 0
- **Spam**: Conversations marked as spam
- **Priority**: Conversations marked as priority

### 2. **Search**

- **Full-text Search**: If collection has text index
- **Regex Fallback**: Search by username or message content
- **Real-time Results**: As user types (debounced)

### 3. **Automation Toggle**

- Per-conversation automation enable/disable
- Prevents rule engine from processing that conversation
- Useful for pausing automation for specific contacts
- Status visualized in chat header

### 4. **Message Management**

- Manual message sending (replyType: 'manual')
- Automated reply tracking (replyType: 'automated')
- AI reply tagging (replyType: 'ai')
- Sentiment analysis on incoming messages
- Message read status tracking

### 5. **Conversation Metadata**

- Priority marking (star icon)
- Spam marking (flag icon)
- Custom tags for organization
- Response time tracking
- Automation status indicator

### 6. **Statistics Dashboard**

- Total conversations count
- Unread conversations count
- Automation rate (automated replies / total replies)
- Average response time
- Message breakdown by type

## Performance Optimization

### Database Indexes

```javascript
// Conversation indexes
db.conversations.createIndex({ userId: 1, instagramAccountId: 1 });
db.conversations.createIndex({ createdAt: -1 });
db.conversations.createIndex({ lastMessageAt: -1 });
db.conversations.createIndex({ unreadCount: 1 });
db.conversations.createIndex({ isPriority: 1 });
db.conversations.createIndex({ isSpam: 1 });
db.conversations.createIndex({ participantUsername: 'text', lastMessage: 'text' });

// Message indexes
db.messages.createIndex({ conversationId: 1, createdAt: -1 });
db.messages.createIndex({ userId: 1, createdAt: -1 });
db.messages.createIndex({ direction: 1 });
```

### Query Optimization

- Use `.lean()` for read-only queries
- Implement pagination (default 20 items per page)
- Debounce search input (300ms)
- Lazy load message history
- Batch update operations

### Frontend Optimization

- Component memoization (React.memo)
- Virtual scrolling for long lists (future enhancement)
- Image lazy loading
- Debounced search
- Request cancellation on unmount

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| 400 - accountId is required | Missing query parameter | Include accountId in request |
| 404 - Conversation not found | Invalid conversation ID | Verify conversation exists |
| 400 - Message cannot be empty | Blank message sent | Validate input before sending |
| 400 - Message is too long | Message > 4096 chars | Enforce character limit in UI |
| 500 - Failed to fetch | Database error | Check MongoDB connection |

## Security Considerations

### Authorization

- All endpoints verify user ownership of conversation
- Users can only access their own account's conversations
- Validate accountId belongs to authenticated user

### Data Validation

- Message length validation (max 4096 characters)
- Input sanitization on tags and search queries
- Type checking for enable/disable flags
- Array validation for tag operations

### Rate Limiting (Recommended)

```javascript
const rateLimit = require('express-rate-limit');

const messageLimiter = rateLimit({
  windowMs: 60 * 1000,     // 1 minute
  max: 30,                 // 30 messages per minute
  message: 'Too many messages sent'
});

router.post('/:conversationId/reply', messageLimiter, ...);
```

## Testing

### Unit Tests

```javascript
describe('ConversationService', () => {
  describe('getConversations', () => {
    it('should return conversations with pagination', async () => {
      const result = await conversationService.getConversations(
        userId, accountId, { page: 1, limit: 20 }
      );
      expect(result.success).toBe(true);
      expect(result.data.length).toBeLessThanOrEqual(20);
    });

    it('should filter by unread conversations', async () => {
      const result = await conversationService.getConversations(
        userId, accountId, { filter: 'unread' }
      );
      expect(result.data.every(c => c.unreadCount > 0)).toBe(true);
    });
  });

  describe('sendManualReply', () => {
    it('should send message and update conversation', async () => {
      const result = await conversationService.sendManualReply(
        userId, accountId, conversationId, 'Test message'
      );
      expect(result.success).toBe(true);
      expect(result.message.replyType).toBe('manual');
    });

    it('should reject empty messages', async () => {
      const result = await conversationService.sendManualReply(
        userId, accountId, conversationId, ''
      );
      expect(result.success).toBe(false);
    });
  });
});
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] WebSocket server configured
- [ ] API routes registered in main app.js
- [ ] Frontend components imported in layout
- [ ] CORS settings configured
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] SSL/TLS certificates installed
- [ ] Database backups scheduled
- [ ] Monitoring and alerting set up

## Future Enhancements

1. **Real-time Typing Indicator**
   - Show when contact is typing
   - Display typing animation

2. **Voice Messages**
   - Accept and send audio messages
   - Transcription support

3. **Message Reactions**
   - Emoji reactions to messages
   - Reaction counter

4. **Conversation Threading**
   - Reply to specific messages
   - Threaded conversations

5. **Advanced Analytics**
   - Sentiment trends
   - Response time trends
   - Engagement metrics

6. **Bulk Operations**
   - Mark multiple as read
   - Bulk tag application
   - Batch archiving

7. **Smart Compose**
   - Suggested replies
   - Template system
   - Auto-complete

## Support

For issues or questions:
1. Check [INBOX_TROUBLESHOOTING.md](./INBOX_TROUBLESHOOTING.md)
2. Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
3. Check system logs
4. Contact development team

---

**Last Updated:** 2024
**Version:** 1.0.0
