# Stripe Integration Examples

## Backend Integration Examples

### Example 1: Protecting Message Sending Route

```javascript
// backend/src/routes/messages.js
const express = require('express');
const { checkMonthlyMessageLimit } = require('../middleware/usageLimits');
const { incrementUsage } = require('../services/usageTracking');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/send',
  authenticateToken,
  checkMonthlyMessageLimit, // Check limit BEFORE sending
  async (req, res, next) => {
    try {
      const { conversationId, content } = req.body;
      const userId = req.user.id;

      // Send message to Instagram
      const message = await sendInstagramMessage(
        conversationId,
        content,
        userId
      );

      // Track usage AFTER successful send
      await incrementUsage(userId, 'messagesThisMonth', 1);

      res.json({
        success: true,
        message,
        remaining: req.usage.remaining, // From middleware
        percentageUsed: req.usage.percentage
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
```

### Example 2: Protecting Automation Rule Creation

```javascript
// backend/src/routes/automationRules.js
const { checkAutomationRuleLimit } = require('../middleware/usageLimits');
const { incrementUsage } = require('../services/usageTracking');

router.post('/create',
  authenticateToken,
  checkAutomationRuleLimit, // Verify user can add rule
  async (req, res, next) => {
    try {
      const { name, trigger, action } = req.body;
      const userId = req.user.id;

      // Create rule
      const rule = await AutomationRule.create({
        userId,
        name,
        trigger,
        action
      });

      // Track usage
      await incrementUsage(userId, 'automationRules', 1);

      res.json({
        success: true,
        rule,
        rulesRemaining: req.usage.remaining
      });
    } catch (error) {
      next(error);
    }
  }
);
```

### Example 3: Protecting Account Addition

```javascript
// backend/src/routes/instagram.js
const { checkInstagramAccountLimit } = require('../middleware/usageLimits');
const { incrementUsage } = require('../services/usageTracking');

router.post('/add-account',
  authenticateToken,
  checkInstagramAccountLimit, // Verify user can add account
  async (req, res, next) => {
    try {
      const { username, accessToken } = req.body;
      const userId = req.user.id;

      // Add account
      const account = await InstagramAccount.create({
        userId,
        username,
        accessToken
      });

      // Track usage
      await incrementUsage(userId, 'instagramAccounts', 1);

      res.json({
        success: true,
        account,
        accountsRemaining: req.usage.remaining,
        accountsLimit: req.usage.limit
      });
    } catch (error) {
      next(error);
    }
  }
);
```

### Example 4: Premium Feature Protection

```javascript
// backend/src/routes/aiReplies.js
const { checkAIReplyLimit, checkMinimumPlan } = require('../middleware/usageLimits');
const { incrementUsage } = require('../services/usageTracking');

// AI replies only for Pro+ plans
router.post('/generate',
  authenticateToken,
  checkMinimumPlan('pro'), // Require Pro or Agency
  checkAIReplyLimit, // Check AI reply limit
  async (req, res, next) => {
    try {
      const { messageContent, conversationId } = req.body;
      const userId = req.user.id;

      // Generate AI reply
      const aiReply = await generateAIReply(messageContent);

      // Track usage
      await incrementUsage(userId, 'aiRepliesUsed', 1);

      res.json({
        success: true,
        reply: aiReply,
        aiRepliesRemaining: req.usage.remaining
      });
    } catch (error) {
      next(error);
    }
  }
);
```

---

## Frontend Integration Examples

### Example 1: Billing Page Integration

```typescript
// frontend/app/billing/page.tsx
'use client';

import React from 'react';
import Billing from '@/components/Billing';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BillingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Billing />
    </div>
  );
}
```

### Example 2: Usage Warning in Dashboard

```typescript
// frontend/components/DashboardHeader.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function DashboardHeader() {
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/billing/usage`);
      setUsage(response.data);
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

  // Show warning if approaching limits
  const showWarning = usage && Object.values(usage.percentages).some(p => p >= 80);

  return (
    <div className="space-y-4">
      {showWarning && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-200">
              You're approaching your limits
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
              Consider upgrading your plan to continue full access to features.
            </p>
            <a href="/billing" className="text-sm font-medium text-yellow-700 hover:text-yellow-800 dark:text-yellow-400 mt-2 inline-block">
              View plans →
            </a>
          </div>
        </div>
      )}

      {/* Rest of header content */}
    </div>
  );
}
```

### Example 3: Usage Display in Settings

```typescript
// frontend/components/AccountSettings.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Zap } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function AccountSettings() {
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/billing/usage`);
      setUsage(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!usage) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6" />
          Plan Usage
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-blue-100 text-sm">Instagram Accounts</p>
            <p className="text-2xl font-bold">
              {usage.usage.accountsUsed} / {usage.limits.instagramAccounts}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Automation Rules</p>
            <p className="text-2xl font-bold">
              {usage.usage.rulesUsed} / {usage.limits.automationRules}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">AI Replies</p>
            <p className="text-2xl font-bold">
              {usage.usage.aiRepliesUsed.toLocaleString()} / {usage.limits.aiReplies.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Monthly Messages</p>
            <p className="text-2xl font-bold">
              {usage.usage.messagesThisMonth.toLocaleString()} / {usage.limits.monthlyMessages.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Example 4: Trial Banner

```typescript
// frontend/components/TrialBanner.tsx
import axios from 'axios';
import { useEffect, useState } from 'react';
import { AlertCircle, Zap } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function TrialBanner() {
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/billing/subscription`);
      setSubscription(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Show trial banner if user is on trial
  if (subscription?.subscription?.status !== 'trialing') {
    return null;
  }

  const daysLeft = Math.ceil(
    (new Date(subscription.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg mb-6 flex items-start justify-between">
      <div className="flex gap-3">
        <Zap className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold mb-1">Free Pro Trial Active!</h3>
          <p className="text-sm opacity-90">
            {daysLeft} days remaining. Enjoy unlimited features!
          </p>
        </div>
      </div>
      <a href="/billing" className="text-sm font-medium hover:underline whitespace-nowrap ml-4">
        Manage →
      </a>
    </div>
  );
}
```

---

## Data Flow Examples

### Signup Flow with Free Trial

```
1. User signs up (Free plan)
   ├─ Create User (plan: 'free')
   └─ No subscription created

2. User clicks "Start Trial"
   ├─ POST /api/billing/trial/start
   ├─ Stripe creates subscription (trialing status)
   ├─ Update User (plan: 'pro', trialEndsAt: +14 days)
   └─ Response: Trial started

3. User enjoys Pro features for 14 days
   └─ All usage limits enforced at Pro level

4. Trial ends (auto-triggered)
   ├─ Stripe webhook: subscription.updated
   ├─ Check subscription status
   ├─ Downgrade to free plan if no payment method
   └─ Notify user
```

### Upgrade Flow

```
1. User clicks "Upgrade to Pro"
   ├─ POST /api/billing/checkout { plan: 'pro' }
   └─ Response: checkout URL

2. User completes payment on Stripe
   ├─ Payment verified
   └─ Redirect to success page

3. Stripe webhook: subscription.created/updated
   ├─ Verify metadata.userId
   ├─ Update User (plan: 'pro')
   ├─ Update Subscription document
   └─ Auto-sync complete

4. User has full Pro access immediately
   └─ All Pro features active
```

### Usage Tracking Flow

```
1. User sends message
   ├─ Request: POST /messages/send
   ├─ Middleware: checkMonthlyMessageLimit
   │  ├─ Check user.usage.messagesThisMonth < limit
   │  ├─ Set req.usage = { canUse, remaining, percentage }
   │  └─ Allow or deny
   └─ If allowed, continue

2. Message sent successfully
   ├─ Service: incrementUsage(userId, 'messagesThisMonth', 1)
   ├─ user.usage.messagesThisMonth++
   ├─ Check if approaching limit (80%)
   └─ Save to database

3. Response includes usage info
   ```json
   {
     "success": true,
     "message": {...},
     "remaining": 5234,
     "percentageUsed": 48
   }
   ```

4. Frontend displays warning if percentage >= 80
   └─ User sees limit warning
```

---

## Error Handling Examples

### Limit Exceeded

```javascript
// When user hits limit
if (!canUse) {
  return res.status(403).json({
    error: 'Monthly message limit reached',
    message: 'You have reached your limit of 1000 messages this month. Please upgrade or wait for next month.',
    limit: 1000,
    usage: 1000,
    percentage: 100,
    nextResetDate: '2026-02-01'
  });
}
```

### Webhook Error

```javascript
// If webhook processing fails
try {
  await handleStripeWebhook(event);
} catch (error) {
  logger.error('Webhook processing failed', {
    eventId: event.id,
    eventType: event.type,
    error: error.message
  });
  
  // Return 400 to retry webhook
  return res.status(400).send(`Webhook Error: ${error.message}`);
}
```

---

## Testing Examples

### Test Upgrade Flow

```bash
# Start Stripe CLI listener
stripe listen --forward-to localhost:5001/api/billing/webhook

# In application, trigger upgrade
POST /api/billing/checkout
{
  "plan": "pro"
}

# Complete payment with test card
4242 4242 4242 4242 (any future date, any CVC)

# Webhook will fire automatically
# Check logs for subscription update
```

### Test Usage Tracking

```bash
# Create test message
POST /api/messages/send { content: "test" }

# Check usage incremented
GET /api/billing/usage
# Should show messagesThisMonth: 1

# Send more messages to test warning
# At 80% of limit, should see warning header
```

---

## Production Checklist Integration

```javascript
// Add this to your deployment checklist
const productionChecklist = {
  stripe: {
    useProduction: 'Use live keys from Stripe',
    testCard: '4242 4242 4242 4242 (test only)',
    webhookUrl: 'Update to production domain',
    priceIds: 'Copy from production Stripe',
  },
  billing: {
    test: 'Complete payment flow',
    monitor: 'Watch for webhook failures',
    alerts: 'Set up Slack notifications',
    email: 'Configure payment receipts',
  },
  usage: {
    enforce: 'Verify limits block actions',
    track: 'Confirm usage increments',
    reset: 'Test monthly reset',
    warn: 'Check 80% warnings',
  }
};
```

---

**Version:** 1.0.0  
**Last Updated:** January 27, 2026
