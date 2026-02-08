'use client'

import { motion } from 'framer-motion'

interface StatModuleProps {
  title: string
  value: string | number
  unit?: string
  icon?: string
  trend?: number
}

export function StatModule({
  title,
  value,
  unit,
  icon,
  trend,
}: StatModuleProps) {
  const isPositive = trend && trend > 0

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="glass-panel neon-border p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-cyber-text/60 text-sm font-mono mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-cyber-primary">{value}</span>
            {unit && <span className="text-sm text-cyber-text/60">{unit}</span>}
          </div>
        </div>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>

      {trend !== undefined && (
        <div className={`text-sm font-mono ${isPositive ? 'text-cyber-primary' : 'text-cyber-accent2'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(trend)}% from last month
        </div>
      )}
    </motion.div>
  )
}

export function MatrixFeed() {
  const messages = [
    { user: 'user_001', message: 'Hi there!', timestamp: 'now' },
    { user: 'user_002', message: 'Need help with...', timestamp: '2m ago' },
    { user: 'user_003', message: 'Thanks!', timestamp: '5m ago' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      className="glass-panel neon-border p-6 space-y-3"
    >
      <h3 className="text-lg font-mono font-bold text-cyber-primary mb-4">LIVE MESSAGE FEED</h3>
      {messages.map((msg, i) => (
        <motion.div
          key={i}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="text-sm font-mono text-cyber-text/80 border-l-2 border-cyber-primary/30 pl-3 py-1"
        >
          <span className="text-cyber-primary">[{msg.timestamp}]</span> {msg.user}: {msg.message}
        </motion.div>
      ))}
    </motion.div>
  )
}
