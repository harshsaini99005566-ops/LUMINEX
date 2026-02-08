// Quick integration guide for adding analytics link to main dashboard

// File: frontend/components/DashboardModules.tsx
// Add this to the dashboard navigation/menu section:

/*
import Link from 'next/link'

export const AnalyticsLink = () => (
  <Link href="/analytics">
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/50 rounded-lg text-green-400 hover:from-green-500/30 hover:to-cyan-500/30 transition-all"
    >
      📊 View Analytics
    </motion.div>
  </Link>
)

// Add to main dashboard:
<div className="flex gap-4 mb-6">
  <AnalyticsLink />
  <Link href="/rules">
    {/* existing rules button */}
  </Link>
</div>
*/

// File: frontend/app/layout.tsx
// Add analytics link to navigation menu:

/*
const navigationItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Analytics', href: '/analytics', icon: '📈' },
  { label: 'Conversations', href: '/conversations', icon: '💬' },
  { label: 'Rules', href: '/dashboard', icon: '⚙️' },
]
*/

export const ANALYTICS_INTEGRATION_NOTES = `
## Integration Steps

### 1. Add Analytics Link to Main Dashboard
File: frontend/components/DashboardModules.tsx

Import:
import Link from 'next/link'
import { motion } from 'framer-motion'

Add to dashboard JSX:
<Link href="/analytics">
  <motion.button
    whileHover={{ scale: 1.05 }}
    className="px-6 py-3 bg-green-500/20 border border-green-500 rounded-lg text-green-400 hover:bg-green-500/30"
  >
    📊 Analytics Dashboard
  </motion.button>
</Link>

### 2. Add to Navigation Menu
File: frontend/app/layout.tsx or header component

Add menu item:
{
  label: 'Analytics',
  href: '/analytics',
  icon: '📈'
}

### 3. Display Analytics Widget on Main Dashboard
File: frontend/app/dashboard/page.tsx

Import:
import AdvancedAnalytics from '@/components/AdvancedAnalytics'

Add to dashboard:
<section className="my-8">
  <h2 className="text-2xl font-bold mb-4">Quick Analytics</h2>
  <AdvancedAnalytics />
</section>

### 4. Update User Onboarding
Show analytics introduction:
- First time showing analytics
- Highlight key metrics
- Suggest exploration of different time ranges

### 5. Add Analytics to Mobile Menu
If you have a mobile menu, add:
- Analytics link
- Quick stats widget
- Export functionality

## Database Indices for Performance

Recommended MongoDB indices for analytics queries:

db.messages.createIndex({ user: 1, createdAt: 1 })
db.messages.createIndex({ user: 1, direction: 1, createdAt: 1 })
db.automationrules.createIndex({ user: 1, isActive: 1 })
db.automationrules.createIndex({ user: 1, successCount: 1 })

## Caching Strategy (Future Enhancement)

Consider implementing Redis caching for:
- Overview metrics (cache for 5 minutes)
- Daily timeline data (cache for 1 hour)
- Rule performance (cache for 10 minutes)

Example:
const cacheKey = \`analytics:\${userId}:overview\`
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)

## Real-time Updates (Future Enhancement)

Consider WebSocket implementation for:
- Live message counts
- Real-time rule trigger notifications
- Live sentiment analysis

Example setup:
io.on('connection', (socket) => {
  socket.on('subscribe:analytics', (userId) => {
    // Subscribe to analytics updates for user
  })
})

## Metrics Collection Best Practices

1. **Message Tracking**
   - Always set direction field (incoming/outgoing)
   - Always set createdAt timestamp
   - Include sentiment analysis

2. **Rule Tracking**
   - Increment triggerCount on each trigger
   - Increment successCount on successful execution
   - Increment failureCount on failure
   - Update lastTriggered timestamp

3. **Data Quality**
   - Ensure no null timestamps
   - Validate direction enum values
   - Regular data cleanup job for old data

## Performance Monitoring

Monitor these metrics:
- Average query time for /overview endpoint
- Memory usage during timeline aggregation
- Database index hit ratio
- API response times by endpoint

## User Experience Enhancements

1. **Tooltips**
   - Add hover tooltips explaining each metric
   - Show metric definitions and calculations

2. **Drill-down**
   - Click on chart points for details
   - Show related conversations
   - Show related rules

3. **Filtering**
   - Filter by account
   - Filter by rule type
   - Filter by sentiment

4. **Comparison**
   - Compare current period to previous
   - Year-over-year trends
   - Custom period comparison

## Alerts and Thresholds

Add alert system for:
- Automation success rate drops below 80%
- No messages for 24 hours
- Rule failure spikes
- Unusual sentiment patterns

## Reporting

Scheduled reports:
- Daily summary at 9 AM
- Weekly detailed report
- Monthly performance review
- Custom report builder

## Integration with Billing

Link analytics to:
- Usage-based pricing display
- Tier upgrade recommendations
- Usage limits warnings
- Overage calculations

## Team Analytics (Enterprise Feature)

- Team-wide metrics
- Per-user breakdown
- Comparative leaderboards
- Team performance trends
`
