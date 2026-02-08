'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, MessageCircle, Zap, BarChart3, Calendar } from 'lucide-react'

interface AnalyticsData {
  totalMessages: number
  automatedReplies: number
  manualReplies: number
  avgResponseTime: number
  conversions: number
  messagesByDay: Array<{ date: string; count: number }>
  topKeywords: Array<{ keyword: string; count: number }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7d')

  const fetchAnalytics = useCallback(async () => {
    const token = localStorage.getItem('token')
    try {
      setLoading(true)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analytics?range=${dateRange}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!res.ok) throw new Error('Failed to fetch analytics')

      const result = await res.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-brand-muted">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Messages',
      value: data?.totalMessages || 0,
      icon: MessageCircle,
      color: 'from-brand-primary to-brand-primary-dark',
      bgColor: 'bg-brand-primary-50',
    },
    {
      label: 'Automated Replies',
      value: data?.automatedReplies || 0,
      icon: Zap,
      color: 'from-brand-accent to-brand-accent-dark',
      bgColor: 'bg-brand-accent-50',
    },
    {
      label: 'Manual Replies',
      value: data?.manualReplies || 0,
      icon: BarChart3,
      color: 'from-brand-secondary to-brand-secondary-dark',
      bgColor: 'bg-brand-secondary-50',
    },
    {
      label: 'Avg Response Time',
      value: `${Math.round(data?.avgResponseTime || 0)}m`,
      icon: TrendingUp,
      color: 'from-brand-primary to-brand-secondary',
      bgColor: 'bg-brand-primary-50',
    },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-heading font-bold text-brand-text mb-2">
              Analytics
            </h1>
            <p className="text-lg text-brand-text-secondary">Track your automation performance</p>
          </div>
          <Calendar className="w-10 h-10 text-brand-primary opacity-20" />
        </div>

        {/* Date Range Filter */}
        <div className="flex gap-3">
          {[
            { label: 'Last 7 Days', value: '7d' },
            { label: 'Last 30 Days', value: '30d' },
            { label: 'Last 90 Days', value: '90d' },
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setDateRange(range.value)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                dateRange === range.value
                  ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-primary hover:shadow-lg'
                  : 'border border-brand-border text-brand-text hover:bg-brand-light-2 hover:border-brand-primary'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className={`card-elevated ${stat.bgColor} border-none group hover:shadow-lg`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-brand-text-secondary mb-1">{stat.label}</p>
                  <p className={`text-3xl font-heading font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} opacity-20 group-hover:opacity-30 transition-opacity flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="h-1 bg-brand-border rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${stat.color}`} style={{ width: '70%' }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Messages by Day */}
        <div className="card-elevated border-none">
          <h2 className="text-xl font-heading font-bold text-brand-text mb-6 flex items-center gap-2">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-brand-primary to-brand-secondary" />
            Messages by Day
          </h2>
          {data?.messagesByDay && data.messagesByDay.length > 0 ? (
            <div className="space-y-4">
              {data.messagesByDay.slice(-7).map((day, i) => {
                const maxCount = Math.max(
                  ...data.messagesByDay.map((d) => d.count)
                )
                const percentage = (day.count / maxCount) * 100
                return (
                  <div key={i} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-brand-text">{day.date}</span>
                      <span className="font-bold text-brand-primary text-lg">
                        {day.count}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-brand-light rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full group-hover:shadow-primary transition-shadow"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-brand-muted text-sm text-center py-8">
              No data available
            </p>
          )}
        </div>

        {/* Top Keywords */}
        <div className="card-elevated border-none">
          <h2 className="text-xl font-heading font-bold text-brand-text mb-6 flex items-center gap-2">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-brand-secondary to-brand-accent" />
            Top Keywords
          </h2>
          {data?.topKeywords && data.topKeywords.length > 0 ? (
            <div className="space-y-3">
              {data.topKeywords.slice(0, 6).map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-brand-light-2 rounded-lg hover:bg-brand-light transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="font-medium text-brand-text group-hover:text-brand-primary transition-colors">{item.keyword}</span>
                  </div>
                  <span className="text-sm font-bold text-brand-secondary">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-brand-muted text-sm text-center py-8">
              No data available
            </p>
          )}
        </div>
      </div>

      {/* Conversion Data */}
      <div className="card-elevated border-none">
        <h2 className="text-xl font-heading font-bold text-brand-text mb-8">
          Performance Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group">
            <div className="mb-3 flex items-center gap-2">
              <p className="text-sm font-semibold text-brand-text-secondary">Conversion Rate</p>
              <div className="w-2 h-2 rounded-full bg-brand-primary" />
            </div>
            <p className="text-4xl font-heading font-bold bg-gradient-to-r from-brand-primary to-brand-primary-dark bg-clip-text text-transparent">
              {data
                ? (
                    ((data.conversions || 0) /
                      (data.totalMessages || 1)) *
                    100
                  ).toFixed(2)
                : '0'}
              %
            </p>
            <p className="text-xs text-brand-muted mt-2">Total conversions tracked</p>
          </div>
          <div className="group">
            <div className="mb-3 flex items-center gap-2">
              <p className="text-sm font-semibold text-brand-text-secondary">Automation Rate</p>
              <div className="w-2 h-2 rounded-full bg-brand-accent" />
            </div>
            <p className="text-4xl font-heading font-bold bg-gradient-to-r from-brand-accent to-brand-accent-dark bg-clip-text text-transparent">
              {data
                ? (
                    ((data.automatedReplies || 0) /
                      (data.totalMessages || 1)) *
                    100
                  ).toFixed(2)
                : '0'}
              %
            </p>
            <p className="text-xs text-brand-muted mt-2">Automated vs manual replies</p>
          </div>
          <div className="group">
            <div className="mb-3 flex items-center gap-2">
              <p className="text-sm font-semibold text-brand-text-secondary">Total Conversations</p>
              <div className="w-2 h-2 rounded-full bg-brand-secondary" />
            </div>
            <p className="text-4xl font-heading font-bold bg-gradient-to-r from-brand-secondary to-brand-secondary-dark bg-clip-text text-transparent">
              {data?.conversions || 0}
            </p>
            <p className="text-xs text-brand-muted mt-2">Active conversations tracked</p>
          </div>
        </div>
      </div>
    </div>
  )
}
