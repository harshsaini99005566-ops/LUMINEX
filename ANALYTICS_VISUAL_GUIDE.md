# Analytics Dashboard - Visual Layout

## Dashboard Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                   ANALYTICS DASHBOARD                          │
│                Real-time insights into your                    │
│              Instagram automation performance                   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Time Range:  [7d]  [30d]  [90d]                              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  OVERVIEW METRICS (4-column grid)                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │ 📤 Messages  │ │ 💬 Replies   │ │ ✅ Automation│           │
│  │    Sent      │ │    Rate      │ │   Success    │           │
│  │   1,234      │ │   82.5%      │ │   94.2%      │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│  ┌──────────────┐                                              │
│  │ ⚙️  Active    │                                              │
│  │    Rules     │                                              │
│  │   5 / 8      │                                              │
│  └──────────────┘                                              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CHARTS GRID (2-column layout, responsive)                    │
│                                                                 │
│  ┌─────────────────────────┬─────────────────────────┐        │
│  │  Messages Sent Over     │  Hourly Activity        │        │
│  │  Time (Line Chart)      │  (Bar Chart)            │        │
│  │                         │                         │        │
│  │  ╱╲                     │  ▁▂▃▄▅▆▇▄▂▁           │        │
│  │ ╱  ╲  ╱╲                │                         │        │
│  │╱    ╲╱  ╲╱╲             │  0:00  6:00  12:00      │        │
│  │                         │        18:00  23:00     │        │
│  └─────────────────────────┴─────────────────────────┘        │
│                                                                 │
│  ┌─────────────────────────┬─────────────────────────┐        │
│  │  Message Sentiment      │  Top Rules              │        │
│  │  (Pie Chart)            │  Performance (%)        │        │
│  │                         │                         │        │
│  │      ◐◕◑                │  Rule A    ████████ 95% │        │
│  │    ●  +  ●              │  Rule B    ███████ 87%  │        │
│  │      ◒◔◓                │  Rule C    ██████ 82%   │        │
│  │                         │  Rule D    ████ 65%     │        │
│  │  Positive: 45%          │  Rule E    ██ 42%       │        │
│  │  Neutral:  40%          │                         │        │
│  │  Negative: 15%          │                         │        │
│  └─────────────────────────┴─────────────────────────┘        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  RULES PERFORMANCE DETAILS (Scrollable Table)                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Rule Name    │ Status  │ Triggers│ Success│ Failure│ %  │   │
│  ├──────────────┼─────────┼─────────┼────────┼────────┼────┤   │
│  │ Welcome Bot  │ Active  │   234   │  222   │   12   │ 95 │   │
│  │ Auto-Reply   │ Active  │   156   │  135   │   21   │ 87 │   │
│  │ Lead Qualify │ Active  │   89    │  73    │   16   │ 82 │   │
│  │ Handoff Rule │ Inactive│   0     │   0    │   0    │  0 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Color Scheme

```
Primary Colors:
├── Background: #0f172a (Slate-950)
├── Dark: #1e293b (Slate-800)
├── Border: #0ece8233 (Green with transparency)
└── Accent: #0ece82 (Green)

Secondary Colors:
├── Info: #00d4ff (Cyan)
├── Success: #0ece82 (Green)
├── Error: #ff6b6b (Red)
└── Warning: #fbbf24 (Amber)

Text Colors:
├── Primary: #ffffff (White)
├── Secondary: #d1d5db (Gray-300)
├── Tertiary: #9ca3af (Gray-400)
└── Disabled: #6b7280 (Gray-500)
```

## Responsive Breakpoints

### Desktop (≥1024px)
```
┌─────────────────────────────────────┐
│  Stat Card │ Stat Card │ Stat Card  │
│   Stat Card                         │
└─────────────────────────────────────┘
┌──────────────────┬──────────────────┐
│  Chart 1         │  Chart 2         │
├──────────────────┼──────────────────┤
│  Chart 3         │  Chart 4         │
└──────────────────┴──────────────────┘
┌─────────────────────────────────────┐
│  Table (Full width)                 │
└─────────────────────────────────────┘
```

### Tablet (768px - 1023px)
```
┌──────────────┬──────────────┐
│ Stat Card    │ Stat Card    │
├──────────────┼──────────────┤
│ Stat Card    │ Stat Card    │
└──────────────┴──────────────┘
┌──────────────────────────────┐
│  Chart 1                     │
├──────────────────────────────┤
│  Chart 2                     │
├──────────────────────────────┤
│  Chart 3                     │
└──────────────────────────────┘
┌──────────────────────────────┐
│  Table (Horizontal scroll)   │
└──────────────────────────────┘
```

### Mobile (< 768px)
```
┌──────────────┐
│ Stat Card    │
├──────────────┤
│ Stat Card    │
├──────────────┤
│ Stat Card    │
├──────────────┤
│ Stat Card    │
└──────────────┘
┌──────────────┐
│  Chart 1     │
├──────────────┤
│  Chart 2     │
├──────────────┤
│  Chart 3     │
├──────────────┤
│  Chart 4     │
└──────────────┘
┌──────────────┐
│  Table       │
│  (Scrollable)│
└──────────────┘
```

## Animation Timeline

### Page Load
```
0ms    ↓
       Loading spinner rotates (2s loop)
       
800ms  ↓
       Data fetches from API
       
1200ms ↓
       Stats cards fade in with stagger (0.1s delay each)
       
1600ms ↓
       Charts animate in (line draws, bars grow)
       
2000ms ↓
       Table fades in
       
2200ms ↓
       All animations complete, interactive
```

### Time Range Change
```
0ms    ↓
       Click [7d] / [30d] / [90d]
       Button highlights
       
50ms   ↓
       Loading spinner shows
       API calls made
       
500ms  ↓
       Data received
       
600ms  ↓
       Charts animate to new values
       
1000ms ↓
       Table updates
       All animations complete
```

## Interaction Flows

### View Different Time Range
```
User Click [30d]
    ↓
Button highlights green
    ↓
Loading spinner appears
    ↓
API calls 5 endpoints
    ↓
Data received
    ↓
Charts animate to new data
    ↓
Table updates
    ↓
Complete in < 1 second
```

### Export Report
```
User Click [Export]
    ↓
API called for overview data
    ↓
Convert to CSV format
    ↓
Trigger browser download
    ↓
File: analytics-report-2026-01-27.csv
    ↓
Complete in < 1 second
```

### View Rule Details
```
User Hovers on Rule Row
    ↓
Row highlights
    ↓
User Clicks Rule (future)
    ↓
Drill-down modal opens
    ↓
Shows detailed rule metrics
    ↓
Related messages displayed
    ↓
User Can modify rule
```

## Data Visualization Examples

### Line Chart (Messages Over Time)
```
300 │                                    ▲
    │                                  ╱ │
250 │                              ╱╲  │ │
    │                          ╱╲╱  ╲│ │ │
200 │                      ╱╲╱      └─┴─┘
    │                  ╱╲╱
150 │              ╱╲╱
    │          ╱╲╱
100 │      ╱╲╱
    │  ╱╲╱
 50 │╱╱
    │
  0 └─────────────────────────────────────
    Jan 1  Jan 8  Jan 15 Jan 22 Jan 27
```

### Bar Chart (Hourly Activity)
```
100 │      ▂      ▅      ▇
    │  ▂▄▆█▆▄▂▁▁▂▄▆█▆▇█▄▂▁▁▂▄▆
 50 │░░░░░░░░░░░░░░░░░░░░░░░
    │░░░░░░░░░░░░░░░░░░░░░░░
  0 └─────────────────────────
    0:00 6:00 12:00 18:00 23:00
```

### Pie Chart (Sentiment)
```
        Positive (45%)
        ╱────╲
       │  ◉ ◉  │
       │   >   │
        ╲────╱
       Neutral 40%
       
    Negative
      (15%)
```

## Stat Card Anatomy

```
┌──────────────────────────────┐
│                              │
│  📤  Messages Sent      1,234 │
│  ────────────────────────    │
│  Label                Value  │
│                        Icon  │
│                              │
│  Change: +12% ↑ (Green)      │
│                              │
└──────────────────────────────┘
```

## Table Layout

```
Rule Name  | Status   | Triggers | Success | Failure | %
-----------|----------|----------|---------|---------|-------
Welcome    | 🟢 Active|   234    |   222   |   12    | 95%
Auto Reply | 🟢 Active|   156    |   135   |   21    | 87%
Qualify    | 🔴 Inact |    0     |    0    |    0    | 0%
```

## Loading State

```
┌─────────────────────────────┐
│                             │
│         Loading             │
│                             │
│          ⟳                  │
│                             │
│     Fetching analytics...   │
│                             │
└─────────────────────────────┘
```

## Empty State

```
┌─────────────────────────────┐
│                             │
│      📊 No data             │
│                             │
│  No messages found in      │
│  selected time range       │
│                             │
│  Try selecting a longer    │
│  time period or create     │
│  more messages             │
│                             │
└─────────────────────────────┘
```

## Error State

```
┌─────────────────────────────┐
│                             │
│      ❌ Error              │
│                             │
│  Failed to load analytics  │
│  data. Please try again.   │
│                             │
│  [Retry]                   │
│                             │
└─────────────────────────────┘
```

## Accessibility

- ✅ Keyboard navigation (Tab, Arrow keys)
- ✅ ARIA labels for screen readers
- ✅ Color not only indicator (icons + text)
- ✅ Sufficient color contrast (WCAG AA)
- ✅ Focus indicators on interactive elements
- ✅ Semantic HTML structure

## Performance Indicators

```
Page Load:
├─ First Contentful Paint: 800ms
├─ Largest Contentful Paint: 1600ms
├─ Time to Interactive: 2000ms
└─ Cumulative Layout Shift: 0

API Performance:
├─ Overview: 150ms
├─ Timeline: 200ms
├─ Rules: 150ms
├─ Sentiment: 180ms
└─ Hourly: 150ms
```

---

This visual guide helps understand the layout, responsive design, animations, and user interactions of the Analytics Dashboard.
