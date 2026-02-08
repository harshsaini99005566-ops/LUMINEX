# 📊 PHASE 1: ANALYTICS IMPLEMENTATION GUIDE
## Complete Step-by-Step Guide (Day 3)

---

## 1. DATABASE SCHEMA

### Create Analytics Models

**MessageMetric Schema**
```javascript
// backend/src/models/MessageMetric.js
import mongoose from 'mongoose'

const messageMetricSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InstagramAccount',
    },
    date: {
      type: Date,
      required: true,
      index: true,
      // Store as YYYY-MM-DD for easier grouping
      get: (val) => val?.toISOString().split('T')[0],
    },
    messagesSent: {
      type: Number,
      default: 0,
    },
    messagesReceived: {
      type: Number,
      default: 0,
    },
    rulesMatched: {
      type: Number,
      default: 0,
    },
    aiRepliesSent: {
      type: Number,
      default: 0,
    },
    avgResponseTime: {
      type: Number, // in seconds
      default: 0,
    },
    conversionCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    indexes: [
      { userId: 1, date: -1 },
      { userId: 1, accountId: 1, date: -1 },
    ],
  }
)

export default mongoose.model('MessageMetric', messageMetricSchema)
```

**RulePerformance Schema**
```javascript
// backend/src/models/RulePerformance.js
import mongoose from 'mongoose'

const rulePerformanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ruleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AutomationRule',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    matchCount: {
      type: Number,
      default: 0,
    },
    replyCount: {
      type: Number,
      default: 0,
    },
    successRate: {
      type: Number, // percentage 0-100
      default: 0,
    },
    avgExecutionTime: {
      type: Number, // milliseconds
      default: 0,
    },
  },
  {
    timestamps: true,
    indexes: [
      { userId: 1, date: -1 },
      { userId: 1, ruleId: 1, date: -1 },
    ],
  }
)

export default mongoose.model('RulePerformance', rulePerformanceSchema)
```

---

## 2. ANALYTICS SERVICE

### Create Analytics Service
```javascript
// backend/src/services/analytics.js
import MessageMetric from '../models/MessageMetric.js'
import RulePerformance from '../models/RulePerformance.js'

export const analyticsService = {
  /**
   * Track message activity
   * Called whenever a message is sent/received
   */
  async trackMessageActivity(userId, accountId, data) {
    try {
      const today = new Date()
      today.setUTCHours(0, 0, 0, 0)

      const metric = await MessageMetric.findOneAndUpdate(
        { userId, accountId, date: today },
        {
          $inc: {
            messagesSent: data.messagesSent || 0,
            messagesReceived: data.messagesReceived || 0,
            rulesMatched: data.rulesMatched || 0,
            aiRepliesSent: data.aiRepliesSent || 0,
          },
          $set: {
            ...(data.avgResponseTime && { avgResponseTime: data.avgResponseTime }),
          },
        },
        { upsert: true, new: true }
      )

      return metric
    } catch (error) {
      console.error('[Analytics] Error tracking message:', error)
      return null
    }
  },

  /**
   * Track rule performance
   * Called when a rule matches and executes
   */
  async trackRulePerformance(userId, ruleId, data) {
    try {
      const today = new Date()
      today.setUTCHours(0, 0, 0, 0)

      const performance = await RulePerformance.findOneAndUpdate(
        { userId, ruleId, date: today },
        {
          $inc: {
            matchCount: data.matchCount || 1,
            replyCount: data.replyCount || 0,
          },
          $set: {
            successRate: data.successRate || 0,
            avgExecutionTime: data.avgExecutionTime || 0,
          },
        },
        { upsert: true, new: true }
      )

      return performance
    } catch (error) {
      console.error('[Analytics] Error tracking rule:', error)
      return null
    }
  },

  /**
   * Get 30-day message trends
   * Returns daily data for charting
   */
  async getMessageTrends(userId, days = 30) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const trends = await MessageMetric.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
            date: { $gte: startDate },
          },
        },
        {
          $sort: { date: 1 },
        },
        {
          $project: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            messagesSent: 1,
            messagesReceived: 1,
            aiRepliesSent: 1,
            rulesMatched: 1,
          },
        },
      ])

      return trends
    } catch (error) {
      console.error('[Analytics] Error getting message trends:', error)
      return []
    }
  },

  /**
   * Get rule performance for top rules
   */
  async getTopRulePerformance(userId, limit = 5) {
    try {
      const today = new Date()
      today.setDate(today.getDate() - 7) // Last 7 days
      today.setUTCHours(0, 0, 0, 0)

      const performance = await RulePerformance.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
            date: { $gte: today },
          },
        },
        {
          $group: {
            _id: '$ruleId',
            totalMatches: { $sum: '$matchCount' },
            totalReplies: { $sum: '$replyCount' },
            avgSuccessRate: { $avg: '$successRate' },
          },
        },
        {
          $sort: { totalMatches: -1 },
        },
        {
          $limit: limit,
        },
        {
          $lookup: {
            from: 'automationrules',
            localField: '_id',
            foreignField: '_id',
            as: 'rule',
          },
        },
        {
          $project: {
            ruleName: { $arrayElemAt: ['$rule.name', 0] },
            totalMatches: 1,
            totalReplies: 1,
            avgSuccessRate: { $round: ['$avgSuccessRate', 2] },
          },
        },
      ])

      return performance
    } catch (error) {
      console.error('[Analytics] Error getting rule performance:', error)
      return []
    }
  },

  /**
   * Get daily stats summary
   */
  async getDailySummary(userId) {
    try {
      const today = new Date()
      today.setUTCHours(0, 0, 0, 0)

      const metric = await MessageMetric.findOne({
        userId,
        date: today,
      })

      return {
        messagesSent: metric?.messagesSent || 0,
        messagesReceived: metric?.messagesReceived || 0,
        aiRepliesSent: metric?.aiRepliesSent || 0,
        rulesMatched: metric?.rulesMatched || 0,
        avgResponseTime: metric?.avgResponseTime || 0,
      }
    } catch (error) {
      console.error('[Analytics] Error getting daily summary:', error)
      return {}
    }
  },
}
```

---

## 3. API ENDPOINTS

### Create Analytics Routes
```javascript
// backend/src/routes/analytics.js
import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { analyticsService } from '../services/analytics.js'

const router = express.Router()

// Protect all analytics routes
router.use(authenticate)

/**
 * GET /api/analytics/summary
 * Get today's summary stats
 */
router.get('/summary', async (req, res) => {
  try {
    const summary = await analyticsService.getDailySummary(req.user.id)
    res.json(summary)
  } catch (error) {
    console.error('[Analytics] Error getting summary:', error)
    res.status(500).json({ error: 'Failed to get summary' })
  }
})

/**
 * GET /api/analytics/trends?days=30
 * Get message trends for charting
 */
router.get('/trends', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30
    const trends = await analyticsService.getMessageTrends(req.user.id, days)
    res.json(trends)
  } catch (error) {
    console.error('[Analytics] Error getting trends:', error)
    res.status(500).json({ error: 'Failed to get trends' })
  }
})

/**
 * GET /api/analytics/top-rules?limit=5
 * Get top performing rules
 */
router.get('/top-rules', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5
    const performance = await analyticsService.getTopRulePerformance(
      req.user.id,
      limit
    )
    res.json(performance)
  } catch (error) {
    console.error('[Analytics] Error getting top rules:', error)
    res.status(500).json({ error: 'Failed to get top rules' })
  }
})

/**
 * POST /api/analytics/track
 * Track message activity (called from message send logic)
 */
router.post('/track', async (req, res) => {
  try {
    const { accountId, ...data } = req.body

    const metric = await analyticsService.trackMessageActivity(
      req.user.id,
      accountId,
      data
    )

    res.json({ success: true, metric })
  } catch (error) {
    console.error('[Analytics] Error tracking activity:', error)
    res.status(500).json({ error: 'Failed to track activity' })
  }
})

export default router
```

### Register Routes in Server
```javascript
// backend/src/server.js
import analyticsRoutes from './routes/analytics.js'

// Add after other routes
app.use('/api/analytics', analyticsRoutes)
```

---

## 4. TRACKING INTEGRATION

### Add Tracking to Message Send
```javascript
// backend/src/routes/messages.js (or similar)
import { analyticsService } from '../services/analytics.js'

router.post('/send', authenticate, async (req, res) => {
  try {
    const { accountId, conversationId, message } = req.body

    // ... existing message send logic ...

    // Track the activity
    await analyticsService.trackMessageActivity(req.user.id, accountId, {
      messagesSent: 1,
      rulesMatched: req.body.rulesMatched ? 1 : 0,
      aiRepliesSent: req.body.isAI ? 1 : 0,
    })

    res.json({ success: true, message: savedMessage })
  } catch (error) {
    console.error('[Messages] Error sending message:', error)
    res.status(500).json({ error: 'Failed to send message' })
  }
})
```

### Add Tracking to Rule Execution
```javascript
// backend/src/jobs/executeRule.js (or similar)
import { analyticsService } from '../services/analytics.js'

export async function executeRule(ruleId, message, userId, accountId) {
  try {
    const startTime = Date.now()

    // ... existing rule execution logic ...

    // Track rule performance
    await analyticsService.trackRulePerformance(userId, ruleId, {
      matchCount: 1,
      replyCount: replyGenerated ? 1 : 0,
      successRate: success ? 100 : 0,
      avgExecutionTime: Date.now() - startTime,
    })
  } catch (error) {
    console.error('[Rule Execution] Error:', error)
  }
}
```

---

## 5. FRONTEND COMPONENTS

### Install Recharts
```bash
cd frontend
npm install recharts
npm install date-fns
```

### Message Trends Chart
```typescript
// components/MessageTrendsChart.tsx
'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAuthStore } from '@/lib/store'
import { apiClient } from '@/lib/api'

export function MessageTrendsChart() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        console.log('[MessageTrendsChart] Fetching trends')
        const response = await apiClient.get('/analytics/trends?days=30')
        setData(response.data)
        console.log('[MessageTrendsChart] Got data:', response.data.length, 'days')
      } catch (error) {
        console.error('[MessageTrendsChart] Error:', error)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchTrends()
    }
  }, [token])

  if (loading) {
    return <div className="h-64 bg-cyber-dark/50 rounded-lg animate-pulse" />
  }

  if (data.length === 0) {
    return (
      <div className="h-64 bg-cyber-dark/50 rounded-lg flex items-center justify-center">
        <p className="text-cyber-text/60">No data yet. Send some messages to see trends!</p>
      </div>
    )
  }

  return (
    <div className="bg-cyber-dark/50 border border-cyber-primary/30 rounded-lg p-6">
      <h3 className="text-lg font-bold text-cyber-primary font-mono mb-4">
        📈 Message Trends (Last 30 Days)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#00ff00" opacity={0.1} />
          <XAxis
            dataKey="date"
            stroke="#00ff00"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#00ff00' }}
          />
          <YAxis stroke="#00ff00" style={{ fontSize: '12px' }} tick={{ fill: '#00ff00' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a0a0a',
              border: '1px solid #00ff00',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#00ff00' }}
          />
          <Legend wrapperStyle={{ color: '#00ff00' }} />
          <Line
            type="monotone"
            dataKey="messagesSent"
            stroke="#00ff00"
            name="Messages Sent"
            strokeWidth={2}
            dot={{ fill: '#00ff00', r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="aiRepliesSent"
            stroke="#00ffff"
            name="AI Replies"
            strokeWidth={2}
            dot={{ fill: '#00ffff', r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="rulesMatched"
            stroke="#ff00ff"
            name="Rules Matched"
            strokeWidth={2}
            dot={{ fill: '#ff00ff', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

### Top Rules Chart
```typescript
// components/TopRulesChart.tsx
'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export function TopRulesChart() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    const fetchRules = async () => {
      try {
        console.log('[TopRulesChart] Fetching top rules')
        const response = await apiClient.get('/analytics/top-rules?limit=5')
        setData(response.data)
        console.log('[TopRulesChart] Got data:', response.data)
      } catch (error) {
        console.error('[TopRulesChart] Error:', error)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchRules()
    }
  }, [token])

  if (loading) {
    return <div className="h-64 bg-cyber-dark/50 rounded-lg animate-pulse" />
  }

  if (data.length === 0) {
    return (
      <div className="h-64 bg-cyber-dark/50 rounded-lg flex items-center justify-center">
        <p className="text-cyber-text/60">No rule data yet. Create and run some rules!</p>
      </div>
    )
  }

  return (
    <div className="bg-cyber-dark/50 border border-cyber-primary/30 rounded-lg p-6">
      <h3 className="text-lg font-bold text-cyber-primary font-mono mb-4">
        🔥 Top Performing Rules
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#00ff00" opacity={0.1} />
          <XAxis dataKey="ruleName" stroke="#00ff00" style={{ fontSize: '12px' }} tick={{ fill: '#00ff00' }} />
          <YAxis stroke="#00ff00" style={{ fontSize: '12px' }} tick={{ fill: '#00ff00' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a0a0a',
              border: '1px solid #00ff00',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#00ff00' }}
          />
          <Legend wrapperStyle={{ color: '#00ff00' }} />
          <Bar dataKey="totalMatches" fill="#00ff00" name="Matches" />
          <Bar dataKey="totalReplies" fill="#00ffff" name="Replies" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

### Analytics Page
```typescript
// app/dashboard/analytics/page.tsx
'use client'

import { MessageTrendsChart } from '@/components/MessageTrendsChart'
import { TopRulesChart } from '@/components/TopRulesChart'
import { AnalyticsSummary } from '@/components/AnalyticsSummary'
import { AuthGuard } from '@/components/AuthGuard'

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-cyber-primary font-mono mb-2">
            📊 Analytics
          </h1>
          <p className="text-cyber-text/60">
            Track your automation performance and message statistics
          </p>
        </div>

        <AnalyticsSummary />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <MessageTrendsChart />
          <TopRulesChart />
        </div>
      </div>
    </AuthGuard>
  )
}
```

### Analytics Summary Component
```typescript
// components/AnalyticsSummary.tsx
'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export function AnalyticsSummary() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        console.log('[AnalyticsSummary] Fetching summary')
        const response = await apiClient.get('/analytics/summary')
        setSummary(response.data)
      } catch (error) {
        console.error('[AnalyticsSummary] Error:', error)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchSummary()
    }
  }, [token])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-cyber-dark/50 rounded-lg" />
        ))}
      </div>
    )
  }

  const stats = [
    {
      label: 'Messages Sent',
      value: summary?.messagesSent || 0,
      icon: '💬',
      color: 'text-cyber-primary',
    },
    {
      label: 'Messages Received',
      value: summary?.messagesReceived || 0,
      icon: '📥',
      color: 'text-cyber-accent1',
    },
    {
      label: 'AI Replies',
      value: summary?.aiRepliesSent || 0,
      icon: '🤖',
      color: 'text-purple-400',
    },
    {
      label: 'Rules Matched',
      value: summary?.rulesMatched || 0,
      icon: '⚙️',
      color: 'text-cyan-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-cyber-dark/50 border border-cyber-primary/30 rounded-lg p-6 hover:border-cyber-primary/60 transition-all"
        >
          <p className="text-cyber-text/60 text-sm font-mono uppercase">{stat.label}</p>
          <p className={`text-4xl font-bold font-mono mt-2 ${stat.color}`}>
            {stat.value}
          </p>
          <p className="text-2xl mt-3">{stat.icon}</p>
        </div>
      ))}
    </div>
  )
}
```

---

## 6. IMPLEMENTATION TIMELINE

### Step 1: Setup (30 minutes)
```bash
# 1. Install dependencies
cd backend
npm install

cd ../frontend
npm install recharts date-fns

# 2. Create models
# - Copy MessageMetric.js to backend/src/models/
# - Copy RulePerformance.js to backend/src/models/
```

### Step 2: Backend Setup (1 hour)
```
1. [ ] Create analytics.js service
2. [ ] Create analytics routes
3. [ ] Register routes in server.js
4. [ ] Add tracking to message send
5. [ ] Add tracking to rule execution
6. [ ] Test endpoints with Postman
```

### Step 3: Frontend Setup (1.5 hours)
```
1. [ ] Create charts components
2. [ ] Create summary component
3. [ ] Create analytics page
4. [ ] Connect to API endpoints
5. [ ] Test on dashboard
```

### Step 4: Testing (1 hour)
```
1. [ ] Send test messages
2. [ ] Check MongoDB for tracking data
3. [ ] Verify charts display correctly
4. [ ] Test on mobile
5. [ ] Deploy to staging
```

---

## 7. TESTING CHECKLIST

```
Backend API:
- [ ] GET /api/analytics/summary returns today's stats
- [ ] GET /api/analytics/trends returns 30-day data
- [ ] GET /api/analytics/top-rules returns top 5 rules
- [ ] POST /api/analytics/track creates new metric

Frontend:
- [ ] Charts render without errors
- [ ] Data loads on analytics page
- [ ] Charts update after sending messages
- [ ] Mobile responsive
- [ ] Loading states work

Database:
- [ ] MessageMetric documents created
- [ ] RulePerformance documents created
- [ ] Data aggregates correctly
- [ ] Indexes working (query fast)
```

---

**Estimated Total Time**: 4 hours
**Difficulty**: Medium
**Dependencies**: recharts, mongoose aggregation

Ready to implement? Start with database models! 📊
