'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

interface AnalyticsData {
  label: string
  value: number | string
  change?: number
  icon: string
}

export const AdvancedAnalytics = () => {
  const [metrics, setMetrics] = useState<AnalyticsData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')

        if (!token) {
          console.error('No auth token found')
          return
        }

        const response = await axios.get(`${API_URL}/api/analytics/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = response.data

        setMetrics([
          {
            label: 'Messages Sent',
            value: data.messagesSent,
            change: 12,
            icon: '📤',
          },
          {
            label: 'Messages Received',
            value: data.messagesReceived,
            change: 8,
            icon: '📥',
          },
          {
            label: 'Replies Rate',
            value: `${data.repliesRate}%`,
            change: 5,
            icon: '💬',
          },
          {
            label: 'Automation Success',
            value: `${data.automationSuccess}%`,
            change: 15,
            icon: '✅',
          },
          {
            label: 'Rule Triggers',
            value: data.totalTriggers,
            change: -3,
            icon: '⚙️',
          },
          {
            label: 'Failed Rules',
            value: data.failureCount,
            change: -10,
            icon: '❌',
          },
        ])
      } catch (error) {
        console.error('[Advanced Analytics] Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  const exportData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/api/analytics/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const csv = convertToCSV(response.data)
      downloadCSV(csv, 'analytics-report.csv')
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const convertToCSV = (data: any) => {
    const headers = Object.keys(data)
    const values = Object.values(data)
    return [headers.join(','), values.join(',')].join('\n')
  }

  const downloadCSV = (csv: string, filename: string) => {
    const link = document.createElement('a')
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
    link.download = filename
    link.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Export Button */}
      <motion.button
        onClick={exportData}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-2 bg-green-500 text-slate-900 rounded-lg font-semibold hover:bg-green-400"
      >
        📊 Export Report
      </motion.button>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            onClick={() => setSelectedMetric(metric.label)}
            whileHover={{ scale: 1.05 }}
            className={`p-6 rounded-lg cursor-pointer transition-all ${
              selectedMetric === metric.label
                ? 'bg-green-500/20 border-2 border-green-500'
                : 'bg-gradient-to-br from-slate-900 to-slate-800 border border-green-500/20'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm mb-2">{metric.label}</p>
                <p className="text-2xl font-bold text-white">{metric.value}</p>
                {metric.change !== undefined && (
                  <p className={`text-sm mt-2 ${metric.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {metric.change >= 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
                  </p>
                )}
              </div>
              <span className="text-3xl opacity-30">{metric.icon}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default AdvancedAnalytics
