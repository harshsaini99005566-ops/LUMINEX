# Analytics Dashboard - Quick Start

## 🚀 Quick Access

**URL**: `http://localhost:3000/analytics`

**Required**: Valid authentication token (automatic redirect to login if not authenticated)

## 📊 Available Metrics

| Metric | Description | Updated |
|--------|-------------|---------|
| Messages Sent | Total outgoing messages | Real-time |
| Messages Received | Total incoming messages | Real-time |
| Replies Rate | % of messages with replies | Real-time |
| Automation Success | % of successful rule triggers | Real-time |
| Active Rules | Count of enabled automation rules | Real-time |
| Rule Triggers | Total times rules were triggered | Real-time |

## 📈 Charts Available

1. **Messages Sent Over Time** (Line Chart)
   - Shows message volume trends
   - Toggle: 7d, 30d, 90d

2. **Hourly Activity** (Bar Chart)
   - Messages by hour of day
   - Helps identify peak activity

3. **Message Sentiment** (Pie Chart)
   - Positive / Neutral / Negative distribution
   - Shows message tone trends

4. **Rules Performance** (Bar Chart)
   - Success rates of top rules
   - Identifies best performing automations

5. **Rules Details** (Table)
   - Comprehensive per-rule metrics
   - Trigger counts, success/failure rates
   - Active status indicator

## 🔧 Key Features

### Time Range Selection
```
[7d] [30d] [90d] buttons at top of dashboard
- Changes all chart data
- Updates metrics calculations
```

### Export Report
```
[📊 Export Report] button
- Downloads analytics as CSV
- Includes all metrics
```

### Rule Performance Table
- Sortable metrics
- Active/Inactive status indicator
- Last triggered timestamp
- Success rate percentage

## 🎨 Design Features

- **Dark Theme** with green accents
- **Responsive Layout** works on mobile
- **Smooth Animations** with Framer Motion
- **Custom SVG Charts** (no heavy dependencies)
- **Real-time Updates** on time range change

## 🔐 Authentication

```typescript
// Token is automatically read from localStorage
const token = localStorage.getItem('token')

// All API requests include:
Authorization: Bearer {token}
```

## 📱 Mobile Support

- Responsive grid layouts
- Touch-friendly buttons
- Readable charts at small screen sizes
- Simplified table view on mobile

## 🐛 Troubleshooting

### No data showing?
1. Ensure you have messages in the system
2. Check token is still valid
3. Refresh the page
4. Check browser console for errors

### Charts not rendering?
- Usually means API returned no data
- Check time period has activity
- Try different time range

### Slow performance?
- Backend aggregation queries can be heavy on large datasets
- Consider shorter time range
- Check MongoDB performance

## 📊 API Endpoints

```
GET /api/analytics/overview              # Main metrics
GET /api/analytics/messages-timeline     # Daily message counts
GET /api/analytics/rules-performance     # Rule stats
GET /api/analytics/sentiment             # Sentiment distribution
GET /api/analytics/hourly-activity       # Hourly breakdown
GET /api/analytics/conversations         # Top conversations
GET /api/analytics/response-time         # Response time stats
```

All require: `Authorization: Bearer {token}`

## 💡 Tips

- Use 30d view for monthly performance
- Use 7d for weekly trends
- Use 90d for quarterly analysis
- Check rule performance table for optimization opportunities
- Export reports for external sharing

## 🎯 Common Use Cases

### Check if automation is working
→ Look at Automation Success % metric

### Identify peak hours
→ Check Hourly Activity chart

### Find best performing rules
→ Review Rules Performance Table

### Analyze message sentiment
→ View Message Sentiment pie chart

### Track message volume
→ Monitor Messages Sent Over Time

## 🚦 What's Coming

- PDF export with styled reports
- Email scheduled reports
- Custom date range picker
- Monthly comparison view
- Team analytics
- Real-time WebSocket updates

## 📝 Notes

- All times are in user's local timezone
- Data is calculated from message database
- Deletion of messages affects historical metrics
- Rules are linked to messages via automationRule field
- Sentiment analysis depends on Message.sentiment field

## 🔗 Related Pages

- Dashboard: `/dashboard`
- Automation Rules: `/dashboard` (Rules section)
- Conversations: `/conversations`
- Settings: `/settings`

---

**Last Updated**: January 2026
