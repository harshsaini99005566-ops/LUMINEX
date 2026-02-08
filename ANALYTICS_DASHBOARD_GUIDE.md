# Analytics Dashboard - Implementation Guide

## Overview

The Analytics Dashboard provides real-time insights into your Instagram automation SaaS performance, tracking key metrics like messages sent, replies rate, automation success, and rule performance.

## Features

### 📊 Core Metrics
- **Messages Sent**: Total outgoing messages in selected timeframe
- **Messages Received**: Total incoming messages
- **Replies Rate**: Percentage of incoming messages that received replies
- **Automation Success Rate**: Success rate of automated rules (%)
- **Active Rules**: Count of active vs. total automation rules
- **Rule Triggers**: Total number of times rules were triggered

### 📈 Visualizations
- **Time-based Charts**: Messages sent over 7, 30, or 90 days
- **Hourly Activity**: Distribution of messages by hour
- **Sentiment Analysis**: Pie chart showing positive/neutral/negative sentiment distribution
- **Rule Performance**: Bar chart of top-performing rules
- **Detailed Rules Table**: Comprehensive performance metrics for all rules

### 🎯 Advanced Features
- Dynamic time range selection (7, 30, 90 days)
- Interactive charts with animations
- Real-time data updates
- Export functionality (CSV)
- Responsive mobile-friendly design

## Architecture

### Backend Endpoints

```
GET /api/analytics/overview
- Returns: Overview metrics (messages, success rate, rules)

GET /api/analytics/messages-timeline?days=30
- Returns: Array of daily message counts

GET /api/analytics/rules-performance
- Returns: Array of rule performance metrics

GET /api/analytics/sentiment?days=30
- Returns: Sentiment distribution (positive/neutral/negative)

GET /api/analytics/hourly-activity?days=7
- Returns: Hourly message activity distribution

GET /api/analytics/conversations?days=30
- Returns: Top conversations with message counts

GET /api/analytics/response-time?days=30
- Returns: Average response time metrics
```

### Frontend Components

#### AnalyticsDashboard.tsx
Main dashboard component with:
- Real-time data fetching
- Multiple chart types (Line, Bar, Pie)
- Stat cards with KPIs
- Detailed rules performance table
- Time range selector

#### AdvancedAnalytics.tsx
Extended analytics with:
- Metric selection
- CSV export functionality
- Change indicators (↑↓)
- Interactive metric cards

#### analytics/page.tsx
Page wrapper with:
- Authentication guard
- Layout and navigation

## Data Models

### AnalyticsOverview
```typescript
{
  messagesSent: number
  messagesReceived: number
  repliesRate: number          // percentage
  automationSuccess: number    // percentage
  totalTriggers: number
  successCount: number
  failureCount: number
  activeRules: number
  totalRules: number
}
```

### RulePerformance
```typescript
{
  id: string
  name: string
  isActive: boolean
  triggers: number
  success: number
  failure: number
  successRate: number
  lastTriggered: Date
}
```

### SentimentAnalysis
```typescript
{
  sentiment: 'positive' | 'neutral' | 'negative'
  count: number
  percentage: number
}
```

## Database Queries

The analytics system uses MongoDB aggregation pipeline for efficient data retrieval:

### Example: Messages Timeline
```javascript
Message.aggregate([
  {
    $match: {
      user: userId,
      direction: 'outgoing',
      createdAt: { $gte: startDate }
    }
  },
  {
    $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      count: { $sum: 1 }
    }
  },
  { $sort: { _id: 1 } }
])
```

## UI Components

### Chart Components
- **LineChart**: Time-series data visualization
- **BarChart**: Category comparison visualization
- **PieChart**: Proportion visualization with legend
- **StatCard**: Key metric display with change indicators

All charts are custom-built with SVG for:
- No external charting library dependency
- Full control over styling and animations
- Responsive design without heavy dependencies
- Dark theme optimized appearance

## Setup Instructions

### 1. Backend Setup
```bash
# Routes are auto-registered in server.js
# No additional setup needed
```

### 2. Frontend Setup
```bash
# Analytics page is automatically available at /analytics
# Requires authentication (redirects to login if not authenticated)
```

### 3. Access Analytics
```
http://localhost:3000/analytics
```

## Authentication

All analytics endpoints require Bearer token authentication:

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

The token should be stored in localStorage as 'token'.

## Performance Optimization

- **Aggregation Pipeline**: MongoDB aggregation for efficient data grouping
- **Limited Time Ranges**: Default max 365 days to prevent memory issues
- **Batch API Calls**: All analytics data fetched in parallel
- **Client-side Caching**: React state management with manual refresh

## Styling

The dashboard uses:
- **Tailwind CSS**: For responsive layout
- **Framer Motion**: For smooth animations
- **Custom SVG Charts**: For lightweight visualizations
- **Dark Theme**: Green accent (#0ece82) with slate background

### Color Scheme
- Primary: #0ece82 (Green)
- Secondary: #00d4ff (Cyan)
- Error: #ff6b6b (Red)
- Background: #0f172a (Slate-950)

## Usage Examples

### Fetch Overview Metrics
```typescript
const response = await axios.get('/api/analytics/overview', {
  headers: { Authorization: `Bearer ${token}` }
})

const {
  messagesSent,
  repliesRate,
  automationSuccess,
  activeRules
} = response.data
```

### Create Custom Chart
```typescript
<LineChart
  data={timeline}
  title="Messages Sent"
  color="#0ece82"
  height={300}
/>
```

## Testing

### Manual Testing Checklist
- [ ] Analytics page loads with authentication
- [ ] Metrics display correct values
- [ ] Time range selector works (7d, 30d, 90d)
- [ ] Charts render properly
- [ ] Rules performance table shows data
- [ ] Export CSV functionality works
- [ ] Mobile responsive design works
- [ ] Charts update when time range changes

### Sample Data Creation
To test with sample data:
```javascript
// Create test messages in database
const testMessages = await Message.create([
  {
    user: userId,
    direction: 'outgoing',
    content: 'Test message',
    createdAt: new Date()
  }
  // ... more test data
])
```

## Troubleshooting

### No Data Displayed
1. Check user has messages in database
2. Verify authentication token is valid
3. Check MongoDB connection
4. Review browser console for errors

### Charts Not Rendering
1. Verify data is returned from API
2. Check browser console for SVG errors
3. Ensure data format matches expected structure
4. Check Tailwind CSS is properly configured

### API Errors
1. Verify JWT_SECRET is set in .env
2. Check user ID is correctly extracted from token
3. Ensure Message and AutomationRule models are connected
4. Review backend logs for query errors

## Future Enhancements

- [ ] Export to PDF with charts
- [ ] Scheduled email reports
- [ ] Custom date range picker
- [ ] Comparison view (month vs month)
- [ ] Team analytics (admin view)
- [ ] Real-time WebSocket updates
- [ ] Machine learning predictions
- [ ] Drill-down analytics by account
- [ ] Custom metric creation
- [ ] Alert thresholds and notifications

## API Rate Limiting

Currently no rate limiting on analytics endpoints.

Recommended limits:
- `/overview`: 10 requests/minute
- `/messages-timeline`: 5 requests/minute
- `/rules-performance`: 5 requests/minute

## Security Considerations

- All endpoints require authentication
- User can only access their own analytics
- MongoDB queries are parameterized to prevent injection
- Time range limits prevent excessive data retrieval
- No sensitive data exposed in API responses

## File Structure

```
frontend/
├── components/
│   ├── AnalyticsDashboard.tsx     # Main dashboard
│   └── AdvancedAnalytics.tsx      # Export & advanced features
├── app/
│   └── analytics/
│       └── page.tsx               # Analytics page
└── types/
    └── analytics.ts               # TypeScript definitions

backend/
└── src/
    └── routes/
        └── analytics.js           # API endpoints
```

## Version History

### v1.0.0 (Current)
- Initial analytics dashboard release
- Core metrics and charts
- Rule performance tracking
- Sentiment analysis
- Hourly activity tracking
- CSV export

## Support

For issues or feature requests, contact the development team.
