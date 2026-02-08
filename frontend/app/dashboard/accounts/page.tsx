'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CyberButton, CyberCard } from '@/components/CyberUI'
import { CyberGrid } from '@/components/CyberGrid'
import { InstagramConnect } from '@/components/InstagramConnect'
import Link from 'next/link'

interface InstagramAccount {
  _id: string
  username: string
  instagramId: string
  profilePicture?: string
  isActive: boolean
  webhooksSubscribed: boolean
  followerCount: number
  createdAt: string
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/instagram/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setAccounts(data.accounts || [])
      setError(null)
    } catch (error) {
      console.error('Error fetching accounts:', error)
      setError('Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleConnectSuccess = () => {
    setConnecting(false)
    fetchAccounts()
  }

  const handleConnectError = (err: string) => {
    setError(`Connection failed: ${err}`)
    setConnecting(false)
  }

  const handleDisconnect = async (accountId: string) => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/instagram/accounts/${accountId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!res.ok) {
        throw new Error('Failed to disconnect')
      }

      setAccounts(accounts.filter((a) => a._id !== accountId))
      setError(null)
    } catch (error) {
      console.error('Error disconnecting:', error)
      setError('Failed to disconnect account')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
        <div className="text-cyber-primary font-mono">LOADING ACCOUNTS...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cyber-dark text-cyber-text">
      <CyberGrid />

      {/* Header */}
      <header className="glass-panel border-b border-cyber-primary/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cyber-primary font-mono">INSTAGRAM ACCOUNTS</h1>
            <p className="text-sm text-cyber-text/60">Manage connected accounts</p>
          </div>
          <Link href="/dashboard">
            <CyberButton variant="ghost">← Back</CyberButton>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 relative z-10">
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 font-mono text-sm"
          >
            ⚠️ {error}
          </motion.div>
        )}

        {/* Connect New */}
        {!connecting && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            {accounts.length === 0 ? (
              <InstagramConnect
                onSuccess={handleConnectSuccess}
                onError={handleConnectError}
              />
            ) : (
              <CyberButton
                onClick={() => setConnecting(true)}
                variant="primary"
                size="lg"
              >
                + Connect Another Account
              </CyberButton>
            )}
          </motion.div>
        )}

        {connecting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <InstagramConnect
              onSuccess={handleConnectSuccess}
              onError={handleConnectError}
            />
          </motion.div>
        )}

        {/* Accounts List */}
        {accounts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-cyber-primary mb-6 font-mono">
              CONNECTED ACCOUNTS ({accounts.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {accounts.map((account: InstagramAccount, i: number) => (
                <motion.div
                  key={account._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <CyberCard className="p-6 h-full flex flex-col">
                    {/* Account Header */}
                    <div className="flex items-start gap-4 mb-6">
                      {account.profilePicture && (
                        <motion.img
                          src={account.profilePicture}
                          alt={account.username}
                          className="w-16 h-16 rounded-full border-2 border-cyber-primary"
                          whileHover={{ scale: 1.1 }}
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-cyber-primary font-mono">
                          @{account.username}
                        </h3>
                        <p className="text-xs text-cyber-text/60 font-mono">
                          ID: {account.instagramId}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            account.isActive
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {account.isActive ? '● ACTIVE' : '○ INACTIVE'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            account.webhooksSubscribed
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {account.webhooksSubscribed ? '🔔 SUBSCRIBED' : '⚠️ NOT SUBSCRIBED'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Account Stats */}
                    <div className="space-y-3 mb-6 flex-1">
                      <div className="flex justify-between items-center p-3 bg-cyber-dark/50 rounded-lg border border-cyber-primary/10">
                        <span className="text-cyber-text/70 text-sm">Followers</span>
                        <span className="text-cyber-primary font-mono font-bold">
                          {account.followerCount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-cyber-dark/50 rounded-lg border border-cyber-primary/10">
                        <span className="text-cyber-text/70 text-sm">Connected</span>
                        <span className="text-cyber-text/60 font-mono text-xs">
                          {new Date(account.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/dashboard/inbox?account=${account._id}`} className="flex-1">
                        <CyberButton variant="secondary" size="sm" className="w-full">
                          📥 Inbox
                        </CyberButton>
                      </Link>
                      <Link href={`/dashboard/rules?account=${account._id}`} className="flex-1">
                        <CyberButton variant="secondary" size="sm" className="w-full">
                          ⚙️ Rules
                        </CyberButton>
                      </Link>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDisconnect(account._id)}
                        className="px-3 py-2 text-xs font-mono text-red-400 hover:bg-red-500/10 border border-red-500/30 rounded-lg transition-all"
                      >
                        ✕ Remove
                      </motion.button>
                    </div>
                  </CyberCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
