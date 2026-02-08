export interface AnalyticsOverview {
  messagesSent: number
  messagesReceived: number
  repliesRate: number
  automationSuccess: number
  totalTriggers: number
  successCount: number
  failureCount: number
  activeRules: number
  totalRules: number
}

export interface MessageTimeline {
  _id: string // date in YYYY-MM-DD format
  count: number
}

export interface RulePerformance {
  id: string
  name: string
  isActive: boolean
  triggers: number
  success: number
  failure: number
  successRate: number
  lastTriggered?: Date
}

export interface SentimentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative'
  count: number
  percentage: number
}

export interface HourlyActivity {
  hour: number
  incoming: number
  outgoing: number
}

export interface ConversationStats {
  _id: string
  messageCount: number
  incomingCount: number
  outgoingCount: number
  lastMessage: Date
}

export interface ResponseTimeMetrics {
  averageResponseTimeMs: number
  averageResponseTimeMinutes: number
  messagesAnalyzed: number
}

export interface AnalyticsChartData {
  date?: string
  hour?: number
  count?: number
  value?: number
  incoming?: number
  outgoing?: number
  label?: string
  name?: string
  sentiment?: string
  percentage?: number
}
