# Analytics Dashboard - Testing Guide

## 📋 Pre-deployment Checklist

### Backend Setup
- [ ] Analytics route registered in server.js
- [ ] Analytics route file exists at `backend/src/routes/analytics.js`
- [ ] Message model has all required fields
- [ ] AutomationRule model has all required fields
- [ ] Authentication middleware is available

### Frontend Setup
- [ ] AnalyticsDashboard component created
- [ ] AdvancedAnalytics component created
- [ ] Analytics page created at `app/analytics/page.tsx`
- [ ] Types defined in `types/analytics.ts`
- [ ] Tailwind CSS configured for styling
- [ ] Framer Motion is available

### Database
- [ ] MongoDB connected and accessible
- [ ] Message collection exists with sample data
- [ ] AutomationRule collection exists with sample data
- [ ] User collection has test account

## 🧪 Unit Testing

### Test API Endpoints

#### GET /api/analytics/overview
```javascript
// Test data
const userId = "test-user-id"
const token = "valid-jwt-token"

// Expected response
{
  messagesSent: number,
  messagesReceived: number,
  repliesRate: number,
  automationSuccess: number,
  totalTriggers: number,
  successCount: number,
  failureCount: number,
  activeRules: number,
  totalRules: number
}

// Test cases
✓ With valid token
✓ Without token (401)
✓ With expired token (401)
✓ With invalid user (404)
✓ With no messages (returns 0s)
✓ With messages (returns correct counts)
```

#### GET /api/analytics/messages-timeline
```javascript
// Test with different time ranges
✓ days=7  (last 7 days)
✓ days=30 (last 30 days)
✓ days=90 (last 90 days)
✓ days=365 (last year, capped)
✓ days=999 (should cap at 365)

// Expected response format
[
  { _id: "2026-01-20", count: 15 },
  { _id: "2026-01-21", count: 22 },
  ...
]

// Edge cases
✓ No data in date range (returns empty array)
✓ Partial data in range (returns available data)
```

#### GET /api/analytics/rules-performance
```javascript
// Expected response
[
  {
    id: "rule-id",
    name: "rule-name",
    isActive: true,
    triggers: 100,
    success: 95,
    failure: 5,
    successRate: 95.00,
    lastTriggered: "2026-01-27T10:30:00Z"
  }
]

// Test cases
✓ Returns all rules for user
✓ Calculates success rate correctly
✓ Shows active/inactive status
✓ Handles division by zero (no triggers)
✓ Sorts by performance
```

#### GET /api/analytics/sentiment
```javascript
// Expected response
[
  { sentiment: "positive", count: 45, percentage: 45.00 },
  { sentiment: "neutral", count: 40, percentage: 40.00 },
  { sentiment: "negative", count: 15, percentage: 15.00 }
]

// Test cases
✓ Correct sentiment distribution
✓ Percentages sum to 100
✓ Different time ranges
✓ No sentiment data (empty array)
```

#### GET /api/analytics/hourly-activity
```javascript
// Expected response - array of 24 hours (0-23)
[
  { hour: 0, incoming: 5, outgoing: 3 },
  { hour: 1, incoming: 2, outgoing: 4 },
  ...
  { hour: 23, incoming: 8, outgoing: 6 }
]

// Test cases
✓ Always returns 24 hours
✓ Missing hours have 0 values
✓ Correct incoming/outgoing split
✓ Different time ranges
```

## 🎨 Component Testing

### AnalyticsDashboard Component
```javascript
// Test rendering
✓ Renders without crashing
✓ Shows loading spinner initially
✓ Displays overview stats cards
✓ Displays charts after loading
✓ Shows rules performance table

// Test interactivity
✓ Time range buttons work (7d, 30d, 90d)
✓ Clicking button updates data
✓ Charts update when time range changes
✓ All 5 charts render correctly
✓ Table shows rules data

// Test error handling
✓ Handles missing auth token
✓ Handles API errors gracefully
✓ Shows error message to user
```

### Chart Components
```javascript
// LineChart
✓ Renders with valid data
✓ Shows title
✓ Displays grid lines
✓ Plots data points
✓ Draws connecting line
✓ Shows empty state with no data

// BarChart
✓ Renders bars with data
✓ Shows labels and values
✓ Uses specified colors
✓ Animates on load
✓ Responsive width

// PieChart
✓ Renders pie slices
✓ Shows legend
✓ Correct proportions
✓ Shows percentages
✓ Handles empty data

// StatCard
✓ Shows label and value
✓ Shows change percentage
✓ Hover effect works
✓ Color coded (green/red for change)
```

### AdvancedAnalytics Component
```javascript
// Test metrics display
✓ Loads and displays all 6 metrics
✓ Shows change indicators
✓ Shows metric icons
✓ Metric selection works (click highlights)

// Test export functionality
✓ Export button exists
✓ Clicking export downloads CSV
✓ CSV has correct headers
✓ CSV has correct values
✓ File named correctly
```

## 🔗 Integration Testing

### Authentication Flow
```javascript
1. User not logged in
   ✓ Redirects to /login
   ✓ No API calls made

2. User logged in
   ✓ Page loads
   ✓ Token sent in headers
   ✓ Data displays correctly

3. Token expires
   ✓ API returns 401
   ✓ User redirected to login (future enhancement)
```

### Data Flow
```javascript
1. Frontend loads analytics page
   ✓ Makes 5 parallel API calls
   ✓ Receives all data
   ✓ Updates UI

2. User changes time range
   ✓ Makes new API calls with new days param
   ✓ Old data removed
   ✓ New data displayed with animation

3. No data available
   ✓ Shows empty states
   ✓ No errors thrown
   ✓ User sees meaningful message
```

## 📊 Manual Testing Scenarios

### Scenario 1: Fresh User with No Data
```
1. Create new user
2. Go to /analytics
3. Expected: All metrics show 0, empty charts
✓ No crashes
✓ Loading handled gracefully
```

### Scenario 2: User with Messages
```
1. Create 50 test messages
2. Go to /analytics
3. Expected: Messages show in charts, correct count
✓ Data loads correctly
✓ Charts render
✓ Metrics calculated properly
```

### Scenario 3: User with Active Rules
```
1. Create 5 active rules with triggers
2. Go to /analytics
3. Expected: Rules show in table, success rate displayed
✓ Table populated
✓ Success rate calculated
✓ Active status shows
```

### Scenario 4: Time Range Selection
```
1. Start on /analytics
2. Click [30d] button
3. Wait for data to load
4. Click [7d] button
5. Expected: Charts update with new data
✓ Animation smooth
✓ Data loads quickly
✓ No duplicates
```

### Scenario 5: Mobile Responsiveness
```
1. Open /analytics on mobile
2. Scroll through dashboard
3. Expected: Layout adapts to screen
✓ Charts readable
✓ Table scrollable
✓ Buttons accessible
✓ No horizontal scroll needed
```

### Scenario 6: Export Report
```
1. Click export button
2. File downloads
3. Open CSV in Excel/Google Sheets
4. Expected: Data formatted correctly
✓ Headers present
✓ Values correct
✓ No corruption
```

## 🐛 Error Scenarios

### API Errors
```
✓ Network timeout - show error message
✓ 401 Unauthorized - redirect to login
✓ 500 Server error - show error message
✓ Empty response - show empty state
```

### Data Quality Issues
```
✓ Missing timestamps - excluded from calculations
✓ Invalid sentiment values - handled gracefully
✓ Null values - treated as 0
✓ Future dates - filtered out
```

### Performance Testing
```
✓ Load time < 2 seconds with 1000 messages
✓ Smooth animations even on slower devices
✓ No memory leaks after 10 time range changes
✓ No lag when hovering over charts
```

## 📈 Performance Benchmarks

```
Endpoint Response Times (goal < 500ms):
- /overview             < 200ms
- /messages-timeline    < 300ms
- /rules-performance    < 200ms
- /sentiment            < 300ms
- /hourly-activity      < 300ms
- /conversations        < 400ms
- /response-time        < 300ms

Page Load Times:
- Initial load          < 2 seconds
- Time range change     < 1 second
- Chart rendering       < 500ms
- Export generation     < 1 second
```

## ✅ Sign-off Checklist

### Code Quality
- [ ] No console.error or console.warn in production code
- [ ] All functions have proper error handling
- [ ] All API responses typed with TypeScript
- [ ] No deprecated dependencies used
- [ ] Code formatted with Prettier
- [ ] No ESLint warnings

### Functionality
- [ ] All endpoints working correctly
- [ ] All charts rendering data
- [ ] Time range selector working
- [ ] Export functionality working
- [ ] Mobile responsive
- [ ] Animations smooth

### Security
- [ ] Authentication required for all endpoints
- [ ] User can only see own data
- [ ] No sensitive data in API responses
- [ ] No SQL/NoSQL injection vulnerabilities
- [ ] CORS properly configured

### Documentation
- [ ] API endpoints documented
- [ ] Components documented with JSDoc
- [ ] Types defined clearly
- [ ] Setup instructions complete
- [ ] Troubleshooting guide included
- [ ] Quick reference available

### Testing
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Manual testing complete
- [ ] Edge cases handled
- [ ] Error cases tested
- [ ] Performance acceptable

## 🚀 Deployment Steps

1. **Backend Deployment**
   ```bash
   npm run build
   npm start
   # Verify endpoints at http://localhost:5001/health
   ```

2. **Frontend Deployment**
   ```bash
   npm run build
   npm start
   # Verify page at http://localhost:3000/analytics
   ```

3. **Post-Deployment Verification**
   ```
   ✓ Analytics page loads
   ✓ Data displays correctly
   ✓ All charts functional
   ✓ Export works
   ✓ Mobile responsive
   ```

4. **Monitoring**
   - Monitor API response times
   - Check error logs
   - Track user engagement
   - Monitor database performance

## 📞 Support

If tests fail, check:
1. MongoDB connection status
2. Environment variables set
3. Node/npm versions
4. Dependencies installed
5. CORS configuration
6. Authentication middleware

---

**Last Updated**: January 2026
**Status**: Ready for Testing
