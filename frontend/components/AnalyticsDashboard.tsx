'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

// Chart components
const LineChart = ({
  data,
  title,
  color = '#0ece82',
  height = 300,
}: {
  data: Array<{ date?: string; hour?: number; count?: number; value?: number; incoming?: number; outgoing?: number }>
  title: string
  color?: string
  height?: number
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="bg-gradient-to-br from-slate-900 to-slate-800 border border-green-500/20 rounded-lg p-6"
        style={{ height }}
      >
        <h3 className="text-green-400 font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center h-full opacity-50">
          <p className="text-gray-400">No data available</p>
        </div>
      </div>
    )
  }

  const maxValue = Math.max(
    ...data.map((d) => {
      if (d.incoming !== undefined && d.outgoing !== undefined) return d.incoming + d.outgoing
      return d.count || d.value || 0
    })
  )
  const normalizedData = data.map((d) => {
    if (d.incoming !== undefined && d.outgoing !== undefined) {
      return (d.incoming + d.outgoing) / (maxValue || 1)
    }
    return (d.count || d.value || 0) / (maxValue || 1)
  })

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-green-500/20 rounded-lg p-6">
      <h3 className="text-green-400 font-semibold mb-4">{title}</h3>
      <svg
        viewBox={`0 0 ${data.length * 40} 300`}
        className="w-full"
        style={{ height }}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <line
            key={`grid-${pct}`}
            x1="0"
            y1={300 - pct * 280}
            x2={data.length * 40}
            y2={300 - pct * 280}
            stroke="#0ece8215"
            strokeWidth="1"
          />
        ))}

        {/* Line path */}
        {normalizedData.length > 1 && (
          <polyline
            points={normalizedData
              .map((val, i) => `${i * 40 + 20},${300 - val * 280}`)
              .join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {normalizedData.map((val, i) => (
          <circle
            key={`point-${i}`}
            cx={i * 40 + 20}
            cy={300 - val * 280}
            r="4"
            fill={color}
            opacity="0.8"
          />
        ))}
      </svg>
    </div>
  )
}

const BarChart = ({
  data,
  title,
  colors = ['#0ece82', '#00d4ff'],
}: {
  data: Array<{ label?: string; name?: string; value?: number; count?: number; sentiment?: string }>
  title: string
  colors?: string[]
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-green-500/20 rounded-lg p-6">
        <h3 className="text-green-400 font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 opacity-50">
          <p className="text-gray-400">No data available</p>
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...data.map((d) => d.value || d.count || 0))

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-green-500/20 rounded-lg p-6">
      <h3 className="text-green-400 font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">{item.label || item.name || item.sentiment}</span>
              <span className="text-green-400">{item.value || item.count || 0}</span>
            </div>
            <div className="bg-slate-700/50 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${colors[i % colors.length]}, ${colors[(i + 1) % colors.length]})`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${((item.value || item.count || 0) / (maxValue || 1)) * 100}%` }}
                transition={{ duration: 1, delay: i * 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const PieChart = ({
  data,
  title,
  colors = ['#0ece82', '#00d4ff', '#ff6b6b'],
}: {
  data: Array<{ name?: string; sentiment?: string; count?: number; percentage?: number }>
  title: string
  colors?: string[]
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-green-500/20 rounded-lg p-6">
        <h3 className="text-green-400 font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 opacity-50">
          <p className="text-gray-400">No data available</p>
        </div>
      </div>
    )
  }

  const total = data.reduce((sum, d) => sum + (d.count || 0), 0)
  let currentAngle = -90

  const slices = data.map((item, i) => {
    const sliceAngle = (item.count || 0) / (total || 1) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + sliceAngle
    currentAngle = endAngle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    const x1 = 100 + 80 * Math.cos(startRad)
    const y1 = 100 + 80 * Math.sin(startRad)
    const x2 = 100 + 80 * Math.cos(endRad)
    const y2 = 100 + 80 * Math.sin(endRad)

    const largeArc = sliceAngle > 180 ? 1 : 0

    return {
      path: `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: colors[i % colors.length],
      label: item.name || item.sentiment,
      count: item.count,
      percentage: item.percentage,
    }
  })

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-green-500/20 rounded-lg p-6">
      <h3 className="text-green-400 font-semibold mb-4">{title}</h3>
      <div className="flex gap-6">
        <svg viewBox="0 0 200 200" className="w-48 h-48">
          {slices.map((slice, i) => (
            <path key={i} d={slice.path} fill={slice.color} opacity="0.8" />
          ))}
        </svg>
        <div className="flex flex-col justify-center space-y-2">
          {slices.map((slice, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }} />
              <span className="text-sm text-gray-300">
                {slice.label}: {slice.count} ({slice.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const StatCard = ({
  label,
  value,
  change,
  icon,
  _color = '#0ece82',
}: {
  label: string
  value: string | number
  change?: number
  icon?: string
  _color?: string
}) => (
  <motion.div
    className="bg-gradient-to-br from-slate-900 to-slate-800 border border-green-500/20 rounded-lg p-6"
    whileHover={{ scale: 1.05 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-400 text-sm mb-2">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {change !== undefined && (
          <p className={`text-sm mt-2 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </p>
        )}
      </div>
      {icon && <span className="text-2xl opacity-20">{icon}</span>}
    </div>
  </motion.div>
)

export default function AnalyticsDashboard() {
  const [overview, setOverview] = useState<any>(null)
  const [timeline, setTimeline] = useState<any[]>([])
  const [rulesPerf, setRulesPerf] = useState<any[]>([])
  const [sentiment, setSentiment] = useState<any[]>([])
  const [hourlyActivity, setHourlyActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDays, setSelectedDays] = useState(30)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')

        if (!token) {
          console.error('No auth token found')
          return
        }

        const headers = { Authorization: `Bearer ${token}` }

        const [overviewRes, timelineRes, rulesRes, sentimentRes, hourlyRes] = await Promise.all([
          axios.get(`${API_URL}/api/analytics/overview`, { headers }),
          axios.get(`${API_URL}/api/analytics/messages-timeline?days=${selectedDays}`, { headers }),
          axios.get(`${API_URL}/api/analytics/rules-performance`, { headers }),
          axios.get(`${API_URL}/api/analytics/sentiment?days=${selectedDays}`, { headers }),
          axios.get(`${API_URL}/api/analytics/hourly-activity?days=7`, { headers }),
        ])

        setOverview(overviewRes.data)
        setTimeline(timelineRes.data)
        setRulesPerf(rulesRes.data)
        setSentiment(sentimentRes.data)
        setHourlyActivity(hourlyRes.data)
      } catch (error) {
        console.error('[Analytics Dashboard] Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [selectedDays])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-green-400 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400">Real-time insights into your Instagram automation</p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6 flex gap-2">
        {[7, 30, 90].map((days) => (
          <button
            key={days}
            onClick={() => setSelectedDays(days)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedDays === days
                ? 'bg-green-500 text-slate-900'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            {days}d
          </button>
        ))}
      </div>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Messages Sent"
            value={overview.messagesSent}
            icon="📤"
            _color="#0ece82"
          />
          <StatCard
            label="Replies Rate"
            value={`${overview.repliesRate}%`}
            icon="💬"
            _color="#00d4ff"
          />
          <StatCard
            label="Automation Success"
            value={`${overview.automationSuccess}%`}
            icon="✅"
            _color="#0ece82"
          />
          <StatCard
            label="Active Rules"
            value={`${overview.activeRules}/${overview.totalRules}`}
            icon="⚙️"
            _color="#ff6b6b"
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Messages Timeline */}
        <LineChart
          data={timeline.map((item) => ({
            date: item._id,
            count: item.count,
          }))}
          title="Messages Sent Over Time"
          color="#0ece82"
          height={300}
        />

        {/* Hourly Activity */}
        <BarChart
          data={hourlyActivity.map((item) => ({
            label: `${item.hour}:00`,
            value: item.incoming + item.outgoing,
          }))}
          title="Hourly Activity"
          colors={['#00d4ff', '#0ece82']}
        />

        {/* Sentiment Distribution */}
        {sentiment.length > 0 && (
          <PieChart
            data={sentiment.map((item) => ({
              sentiment: item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1),
              count: item.count,
              percentage: item.percentage,
            }))}
            title="Message Sentiment"
            colors={['#0ece82', '#00d4ff', '#ff6b6b']}
          />
        )}

        {/* Rules Performance */}
        <BarChart
          data={rulesPerf.slice(0, 5).map((rule) => ({
            label: rule.name,
            value: rule.successRate,
          }))}
          title="Top Rules Performance (Success Rate %)"
          colors={['#0ece82']}
        />
      </div>

      {/* Detailed Rules Performance Table */}
      {rulesPerf.length > 0 && (
        <motion.div
          className="bg-gradient-to-br from-slate-900 to-slate-800 border border-green-500/20 rounded-lg p-6 overflow-x-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-green-400 font-semibold mb-4">Rules Performance Details</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-green-500/20">
                <th className="text-left py-3 px-4 text-gray-300">Rule Name</th>
                <th className="text-center py-3 px-4 text-gray-300">Status</th>
                <th className="text-center py-3 px-4 text-gray-300">Triggers</th>
                <th className="text-center py-3 px-4 text-gray-300">Success</th>
                <th className="text-center py-3 px-4 text-gray-300">Failure</th>
                <th className="text-center py-3 px-4 text-gray-300">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {rulesPerf.slice(0, 10).map((rule, i) => (
                <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-3 px-4 text-gray-200">{rule.name}</td>
                  <td className="text-center py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rule.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4 text-gray-300">{rule.triggers}</td>
                  <td className="text-center py-3 px-4 text-green-400">{rule.success}</td>
                  <td className="text-center py-3 px-4 text-red-400">{rule.failure}</td>
                  <td className="text-center py-3 px-4 font-semibold text-green-400">
                    {rule.successRate.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  )
}
