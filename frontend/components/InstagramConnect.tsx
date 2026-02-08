'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CyberCard, CyberButton } from './CyberUI'

interface InstagramConnectProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function InstagramConnect({ onSuccess, onError }: InstagramConnectProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const connected = params.get('connected')
    const errorMsg = params.get('error')

    if (errorMsg) {
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    if (connected === 'true') {
      setError(null)
      onSuccess?.()
    }
  }, [onSuccess, onError])

  const handleConnect = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get auth URL from backend
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/instagram/auth/url`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to get authorization URL')
      }

      const { url } = await response.json()

      // Redirect to Meta login
      window.location.href = url
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      onError?.(errorMessage)
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <CyberCard className="p-8 text-center">
        <div className="mb-6">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-xl font-bold text-cyber-primary mb-2 font-mono">
            INSTAGRAM BUSINESS ACCOUNT
          </h3>
          <p className="text-cyber-text/60">
            Connect your Instagram Business Account to enable DM automation
          </p>
        </div>

        <div className="bg-cyber-dark rounded-lg p-4 mb-6 text-left text-sm font-mono">
          <div className="text-cyber-text/60 mb-3">Requirements:</div>
          <ul className="space-y-1 text-cyber-text/70">
            <li>✓ Instagram Business Account (not personal)</li>
            <li>✓ Linked to a Facebook Page</li>
            <li>✓ Access to business settings</li>
            <li>✓ Accepts permissions for messaging</li>
          </ul>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-300 text-sm font-mono"
          >
            {error}
          </motion.div>
        )}

        <CyberButton
          onClick={handleConnect}
          variant="primary"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Redirecting to Instagram...' : 'Connect Instagram Account'}
        </CyberButton>

        <p className="text-xs text-cyber-text/40 mt-4">
          You&apos;ll be redirected to Instagram to approve access
        </p>
      </CyberCard>
    </motion.div>
  )
}
