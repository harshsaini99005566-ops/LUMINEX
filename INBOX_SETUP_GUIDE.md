# LUMINEX Inbox - Integration Setup Guide

## Quick Integration Steps

### Step 1: Register API Routes

In your main Express app file (`backend/src/index.js` or `backend/src/app.js`):

```javascript
// Import the conversations routes
const conversationsRouter = require('./routes/conversations');

// Register with authentication middleware
app.use('/api/conversations', authenticateUser, conversationsRouter);

// Make sure this is after authentication middleware setup
// and before error handling middleware
```

### Step 2: Verify Database Models

Ensure these models exist and are properly exported:

```javascript
// backend/src/models/Conversation.js
const conversationSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  instagramAccountId: mongoose.Schema.Types.ObjectId,
  participantId: String,
  participantUsername: String,
  participantProfilePic: String,
  lastMessage: String,
  lastMessageAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  unreadCount: { type: Number, default: 0 },
  messageCount: { type: Number, default: 0 },
  automatedReplies: { type: Number, default: 0 },
  manualReplies: { type: Number, default: 0 },
  isPriority: { type: Boolean, default: false },
  isSpam: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  automationEnabled: { type: Boolean, default: true },
  tags: [String],
  overallSentiment: String,
  responseTime: Number,
  metadata: mongoose.Schema.Types.Mixed
});

// Create indexes
conversationSchema.index({ userId: 1, instagramAccountId: 1 });
conversationSchema.index({ createdAt: -1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ unreadCount: 1 });
conversationSchema.index({ participantUsername: 'text', lastMessage: 'text' });

module.exports = mongoose.model('Conversation', conversationSchema);
```

```javascript
// backend/src/models/Message.js
const messageSchema = new mongoose.Schema({
  conversationId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  senderId: String,
  senderName: String,
  content: { type: String, maxlength: 4096 },
  direction: { type: String, enum: ['incoming', 'outgoing'] },
  replyType: { type: String, enum: ['manual', 'automated', 'ai', 'handoff'] },
  mediaUrls: [String],
  sentiment: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  processedAt: Date,
  metadata: mongoose.Schema.Types.Mixed
});

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ userId: 1, createdAt: -1 });
messageSchema.index({ direction: 1 });

module.exports = mongoose.model('Message', messageSchema);
```

### Step 3: Set Up Logger

Ensure you have a logger utility. Create if missing:

```javascript
// backend/utils/logger.js
const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logger = {
  info: (message, data = '') => {
    console.log(`[INFO] ${message}`, data);
  },
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message, data = '') => {
    console.warn(`[WARN] ${message}`, data);
  },
  debug: (message, data = '') => {
    if (process.env.DEBUG) {
      console.log(`[DEBUG] ${message}`, data);
    }
  }
};

module.exports = logger;
```

### Step 4: Create ConversationService

Place the complete `conversationService.js` file in `backend/src/services/`.

### Step 5: Update Backend Main App

```javascript
// backend/src/app.js or backend/src/index.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('../utils/logger');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/luminex')
  .then(() => logger.info('MongoDB connected'))
  .catch(err => logger.error('MongoDB connection error', err));

// Authentication middleware (implement as needed)
const authenticateUser = (req, res, next) => {
  // Extract from JWT, session, etc.
  // Set req.user with userId
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Routes
const conversationsRouter = require('./routes/conversations');
app.use('/api/conversations', authenticateUser, conversationsRouter);

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error', error);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;
```

### Step 6: Frontend Integration

#### Option A: Full Page

Create a new page/route:

```typescript
// frontend/app/inbox/page.tsx
'use client';

import Inbox from '@/components/Inbox';
import { useRouter } from 'next/navigation';

export default function InboxPage() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear auth and redirect
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <Inbox onLogout={handleLogout} />
  );
}
```

#### Option B: Dashboard Component

```typescript
// frontend/components/Dashboard.tsx
import Inbox from './Inbox';

export default function Dashboard() {
  return (
    <div>
      <Inbox />
    </div>
  );
}
```

#### Option C: Individual Components

```typescript
// frontend/components/MyChat.tsx
'use client';

import { useState } from 'react';
import ConversationList from './ConversationList';
import ChatDisplay from './ChatDisplay';

export default function MyChat() {
  const [selectedId, setSelectedId] = useState('');
  const accountId = 'your-account-id'; // Get from props or context

  return (
    <div className="flex h-screen">
      <div className="w-96">
        <ConversationList
          accountId={accountId}
          onSelectConversation={setSelectedId}
          selectedConversationId={selectedId}
        />
      </div>
      <div className="flex-1">
        {selectedId ? (
          <ChatDisplay
            conversationId={selectedId}
            accountId={accountId}
            onBack={() => setSelectedId('')}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to start
          </div>
        )}
      </div>
    </div>
  );
}
```

### Step 7: WebSocket Integration (Optional but Recommended)

```javascript
// backend/src/socket/conversationSocket.js
const logger = require('../../utils/logger');

function setupConversationSocket(io) {
  io.on('connection', (socket) => {
    logger.info('User connected to conversations', socket.id);

    // Join conversation room
    socket.on('join-conversation', (data) => {
      const { conversationId, userId } = data;
      socket.join(`conversation:${conversationId}`);
      logger.info(`User joined conversation`, { conversationId, userId });
    });

    // Leave conversation room
    socket.on('leave-conversation', (data) => {
      const { conversationId } = data;
      socket.leave(`conversation:${conversationId}`);
    });

    // Broadcast new message
    socket.on('new-message', (data) => {
      const { conversationId, message } = data;
      io.to(`conversation:${conversationId}`).emit('message:received', message);
    });

    // Broadcast automation toggle
    socket.on('automation-toggled', (data) => {
      const { conversationId, enabled } = data;
      io.to(`conversation:${conversationId}`).emit('automation:changed', { enabled });
    });

    socket.on('disconnect', () => {
      logger.info('User disconnected', socket.id);
    });
  });
}

module.exports = setupConversationSocket;
```

```javascript
// backend/src/index.js - Add Socket.io
const http = require('http');
const Server = require('socket.io').Server;
const app = require('./app');
const setupConversationSocket = require('./socket/conversationSocket');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

setupConversationSocket(io);

server.listen(5000, () => {
  console.log('Server running with WebSocket support');
});
```

Frontend WebSocket setup:

```typescript
// frontend/hooks/useConversationSocket.ts
'use client';

import { useEffect } from 'react';
import io from 'socket.io-client';

export function useConversationSocket(conversationId: string) {
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

    socket.emit('join-conversation', {
      conversationId,
      userId: 'current-user-id'
    });

    socket.on('message:received', (message) => {
      // Update UI with new message
      console.log('New message:', message);
    });

    socket.on('automation:changed', (data) => {
      // Update automation status
      console.log('Automation changed:', data);
    });

    return () => {
      socket.emit('leave-conversation', { conversationId });
      socket.disconnect();
    };
  }, [conversationId]);
}
```

### Step 8: Environment Variables

Create or update `.env.local` for frontend and `.env` for backend:

```env
# backend/.env
MONGODB_URI=mongodb://localhost:27017/luminex
PORT=5000
NODE_ENV=development
DEBUG=true

# Authentication
JWT_SECRET=your-secret-key

# CORS
FRONTEND_URL=http://localhost:3000

# Instagram API
INSTAGRAM_API_URL=https://graph.instagram.com/v18.0
INSTAGRAM_ACCESS_TOKEN=your-token
```

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Step 9: Dependencies

Ensure all dependencies are installed:

```bash
# Backend
npm install express mongoose cors socket.io axios dotenv

# Frontend
npm install axios socket.io-client lucide-react antd
```

### Step 10: Database Indexes

Create indexes for optimal performance:

```javascript
// Run once during initialization
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

async function createIndexes() {
  await Conversation.collection.createIndex({ userId: 1, instagramAccountId: 1 });
  await Conversation.collection.createIndex({ createdAt: -1 });
  await Conversation.collection.createIndex({ lastMessageAt: -1 });
  await Conversation.collection.createIndex({ unreadCount: 1 });
  await Conversation.collection.createIndex({ isPriority: 1 });
  await Conversation.collection.createIndex({ participantUsername: 'text', lastMessage: 'text' });
  
  await Message.collection.createIndex({ conversationId: 1, createdAt: -1 });
  await Message.collection.createIndex({ userId: 1, createdAt: -1 });
  
  console.log('Indexes created successfully');
}

module.exports = { createIndexes };
```

## Testing the Integration

### 1. Test API Endpoints

```bash
# Get conversations
curl -X GET "http://localhost:5000/api/conversations?accountId=123&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get specific conversation
curl -X GET "http://localhost:5000/api/conversations/conv123?accountId=123" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Send message
curl -X POST "http://localhost:5000/api/conversations/conv123/reply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"accountId":"123","content":"Hello!"}'

# Toggle automation
curl -X PATCH "http://localhost:5000/api/conversations/conv123/automation" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"accountId":"123","enabled":false}'
```

### 2. Test Frontend Components

```typescript
// In a test file
import { render, screen } from '@testing-library/react';
import ConversationList from '@/components/ConversationList';

describe('ConversationList', () => {
  it('renders conversation list', async () => {
    render(
      <ConversationList
        accountId="test-account"
        selectedConversationId="test-id"
      />
    );

    await screen.findByText('Inbox');
  });
});
```

### 3. Manual Testing Checklist

- [ ] Load inbox page
- [ ] Select Instagram account
- [ ] View conversation list
- [ ] Search conversations
- [ ] Filter by unread/spam/priority
- [ ] Select conversation
- [ ] View message history
- [ ] Send manual message
- [ ] Toggle automation
- [ ] Mark as spam/priority
- [ ] Add/remove tags
- [ ] Archive conversation
- [ ] View statistics

## Troubleshooting

### Common Issues

**Issue: 401 Unauthorized on API calls**
- Solution: Verify JWT token is included in Authorization header
- Check authentication middleware configuration

**Issue: Conversations not loading**
- Solution: Check MongoDB connection
- Verify user has conversations in database
- Check CORS settings

**Issue: WebSocket not connecting**
- Solution: Verify Socket.io server is running
- Check CORS settings in Socket.io config
- Verify client URL is correct

**Issue: Messages not sending**
- Solution: Check message content is not empty
- Verify conversation exists
- Check rate limiting isn't blocking requests

## Next Steps

1. Implement real-time WebSocket events
2. Add voice message support
3. Implement message reactions
4. Add bulk operations
5. Create advanced analytics dashboard
6. Add suggestion/template system

---

**Version:** 1.0.0
**Last Updated:** 2024
