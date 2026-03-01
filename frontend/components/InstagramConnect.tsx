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

      // Use Facebook OAuth to connect Instagram Business accounts
      // Instagram Business accounts MUST be connected through Facebook Pages
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const facebookOAuthUrl = `${apiUrl}/api/auth/facebook`
      
      // Redirect to Facebook OAuth
      window.location.href = facebookOAuthUrl
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
            CONNECT INSTAGRAM BUSINESS
          </h3>
          <p className="text-cyber-text/60">
            Connect via Facebook to access your Instagram Business accounts linked to Facebook Pages
          </p>
        </div>

        <div className="bg-cyber-dark rounded-lg p-4 mb-6 text-left text-sm font-mono">
          <div className="text-cyber-text/60 mb-3">Requirements:</div>
          <ul className="space-y-1 text-cyber-text/70">
            <li>✓ Facebook account with managed pages</li>
            <li>✓ Instagram Business Account (not personal)</li>
            <li>✓ Instagram linked to your Facebook Page</li>
            <li>✓ Admin access to Facebook Page</li>
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
          {loading ? 'Redirecting to Facebook...' : 'Connect via Facebook'}
        </CyberButton>

        <p className="text-xs text-cyber-text/40 mt-4">
          You&apos;ll login with Facebook to access Instagram Business accounts
        </p>
      </CyberCard>
    </motion.div>
  )
}
