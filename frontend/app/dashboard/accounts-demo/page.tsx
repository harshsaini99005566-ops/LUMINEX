'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  MessageCircle, 
  Settings, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  Eye, 
  BarChart3,
  Heart,
  MessageSquare,
  Share2,
  Users,
  TrendingUp,
  Crown,
  AlertCircle
} from 'lucide-react'

interface ConnectedAccount {
  id: string
  username: string
  displayName: string
  profilePicture: string
  followers: number
  followersChange: number
  biography: string
  isActive: boolean
  connectedDate: string
  lastSync: string
  postsCount: number
  engagementRate: number
  tier: 'free' | 'pro' | 'enterprise'
}

interface AccountStats {
  messagesThisMonth: number
  automatedReplies: number
  responseRate: number
  avgResponseTime: string
}

export default function AccountsDemoPage() {
  // Dummy data for demonstration
  const [accounts] = useState<ConnectedAccount[]>([
    {
      id: '1',
      username: 'john_creative',
      displayName: 'John Creative',
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      followers: 24500,
      followersChange: 1250,
      biography: 'Creative Director 🎨 | Content Creator | Building amazing content',
      isActive: true,
      connectedDate: '2025-12-15',
      lastSync: '2 hours ago',
      postsCount: 342,
      engagementRate: 8.4,
      tier: 'pro'
    },
    {
      id: '2',
      username: 'business_pro_hub',
      displayName: 'Business Pro Hub',
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Business',
      followers: 156800,
      followersChange: 5600,
      biography: 'Business tips | Marketing strategies | Growth hacks 📈',
      isActive: true,
      connectedDate: '2025-11-20',
      lastSync: '1 hour ago',
      postsCount: 587,
      engagementRate: 12.1,
      tier: 'enterprise'
    },
    {
      id: '3',
      username: 'travel_adventures_',
      displayName: 'Travel Adventures',
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Travel',
      followers: 8900,
      followersChange: 320,
      biography: '✈️ Exploring the world | Travel tips & inspiration',
      isActive: true,
      connectedDate: '2026-01-10',
      lastSync: '30 minutes ago',
      postsCount: 156,
      engagementRate: 5.2,
      tier: 'free'
    }
  ])

  const [selectedAccount, setSelectedAccount] = useState<ConnectedAccount | null>(accounts[0])
  const [showMenu, setShowMenu] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const accountStats: AccountStats = {
    messagesThisMonth: 1247,
    automatedReplies: 856,
    responseRate: 94.2,
    avgResponseTime: '2.5 mins'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light to-brand-light-2">
      {/* Header */}
      <div className="bg-white border-b border-brand-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard">
                <button className="text-brand-primary hover:text-brand-primary-dark flex items-center gap-2 text-sm mb-3">
                  ← Back to Dashboard
                </button>
              </Link>
              <h1 className="text-3xl font-heading font-bold text-brand-text">
                Connected Accounts
              </h1>
              <p className="text-brand-text-secondary mt-1">
                Demo Dashboard - Manage and view your Instagram accounts
              </p>
            </div>
            <button className="btn-primary px-6 py-3">
              + Add Account
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Accounts List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-brand-border">
              <div className="p-4 border-b border-brand-border">
                <h2 className="font-heading font-bold text-brand-text">
                  Your Accounts ({accounts.length})
                </h2>
              </div>
              
              <div className="divide-y divide-brand-border max-h-[600px] overflow-y-auto">
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => setSelectedAccount(account)}
                    className={`w-full p-4 text-left hover:bg-brand-light transition-colors ${
                      selectedAccount?.id === account.id 
                        ? 'bg-brand-primary-50 border-l-4 border-brand-primary' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={account.profilePicture}
                        alt={account.username}
                        className="w-12 h-12 rounded-full border-2 border-brand-border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-brand-text truncate">
                          @{account.username}
                        </p>
                        <p className="text-xs text-brand-text-secondary">
                          {(account.followers / 1000).toFixed(1)}K followers
                        </p>
                      </div>
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
                        account.isActive 
                          ? 'bg-green-500' 
                          : 'bg-gray-400'
                      }`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Account Details */}
          {selectedAccount && (
            <div className="lg:col-span-2 space-y-6">
              {/* Account Card */}
              <div className="bg-white rounded-lg border border-brand-border overflow-hidden">
                {/* Header Image */}
                <div className="h-32 bg-gradient-to-r from-brand-primary to-brand-secondary relative">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedAccount.tier === 'enterprise' 
                        ? 'bg-purple-100 text-purple-700'
                        : selectedAccount.tier === 'pro'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedAccount.tier === 'enterprise' && <Crown className="w-4 h-4" />}
                      {selectedAccount.tier.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Profile Section */}
                <div className="relative px-6 pb-6">
                  <div className="flex gap-4 -mt-16 mb-4">
                    <img
                      src={selectedAccount.profilePicture}
                      alt={selectedAccount.username}
                      className="w-24 h-24 rounded-lg border-4 border-white"
                    />
                    <div className="flex-1 pt-8">
                      <h2 className="text-2xl font-bold text-brand-text">
                        {selectedAccount.displayName}
                      </h2>
                      <p className="text-brand-primary font-medium">@{selectedAccount.username}</p>
                      <p className="text-sm text-brand-text-secondary mt-1">
                        Connected {selectedAccount.connectedDate}
                      </p>
                    </div>
                  </div>

                  <p className="text-brand-text-secondary text-sm mb-4">
                    {selectedAccount.biography}
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="bg-brand-light-2 rounded-lg p-3">
                      <div className="text-sm text-brand-text-secondary mb-1">Followers</div>
                      <div className="text-xl font-bold text-brand-text">
                        {(selectedAccount.followers / 1000).toFixed(1)}K
                      </div>
                      <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        +{(selectedAccount.followersChange / 1000).toFixed(1)}K
                      </div>
                    </div>
                    <div className="bg-brand-light-2 rounded-lg p-3">
                      <div className="text-sm text-brand-text-secondary mb-1">Posts</div>
                      <div className="text-xl font-bold text-brand-text">
                        {selectedAccount.postsCount}
                      </div>
                    </div>
                    <div className="bg-brand-light-2 rounded-lg p-3">
                      <div className="text-sm text-brand-text-secondary mb-1">Engagement</div>
                      <div className="text-xl font-bold text-brand-text">
                        {selectedAccount.engagementRate}%
                      </div>
                    </div>
                    <div className="bg-brand-light-2 rounded-lg p-3">
                      <div className="text-sm text-brand-text-secondary mb-1">Last Sync</div>
                      <div className="text-xs font-semibold text-brand-text">
                        {selectedAccount.lastSync}
                      </div>
                      <button className="text-xs text-brand-primary hover:text-brand-primary-dark mt-1">
                        Sync now →
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button className="flex-1 btn-primary flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Inbox
                    </button>
                    <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </button>
                    <button className="btn-secondary px-4 flex items-center justify-center gap-2">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg border border-brand-border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-brand-text-secondary">Messages</p>
                      <p className="text-2xl font-bold text-brand-text">
                        {accountStats.messagesThisMonth}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-brand-text-secondary">This month</p>
                </div>

                <div className="bg-white rounded-lg border border-brand-border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-brand-text-secondary">Automated</p>
                      <p className="text-2xl font-bold text-brand-text">
                        {accountStats.automatedReplies}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-brand-text-secondary">Replies sent</p>
                </div>

                <div className="bg-white rounded-lg border border-brand-border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-brand-text-secondary">Response Rate</p>
                      <p className="text-2xl font-bold text-brand-text">
                        {accountStats.responseRate}%
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-brand-text-secondary">This month</p>
                </div>

                <div className="bg-white rounded-lg border border-brand-border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-brand-text-secondary">Avg Response</p>
                      <p className="text-2xl font-bold text-brand-text">
                        {accountStats.avgResponseTime}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-brand-text-secondary">Time</p>
                </div>
              </div>

              {/* Account Settings */}
              <div className="bg-white rounded-lg border border-brand-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-bold text-brand-text">Account Settings</h3>
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(selectedAccount.id)}
                      className="p-2 hover:bg-brand-light rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-brand-text-secondary" />
                    </button>
                    {showMenu === selectedAccount.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-brand-border shadow-lg z-50">
                        <button className="w-full px-4 py-2 text-left hover:bg-brand-light flex items-center gap-2 text-sm text-brand-text">
                          <Edit2 className="w-4 h-4" />
                          Edit Account
                        </button>
                        <button className="w-full px-4 py-2 text-left hover:bg-brand-light flex items-center gap-2 text-sm text-brand-text">
                          <Eye className="w-4 h-4" />
                          View Settings
                        </button>
                        <div className="border-t border-brand-border"></div>
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(selectedAccount.id)
                            setShowMenu(null)
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          Disconnect
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-brand-light-2 rounded-lg">
                    <div>
                      <p className="font-medium text-brand-text">Auto Replies</p>
                      <p className="text-xs text-brand-text-secondary">Enable automated responses</p>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-brand-light-2 rounded-lg">
                    <div>
                      <p className="font-medium text-brand-text">Webhook Notifications</p>
                      <p className="text-xs text-brand-text-secondary">Receive real-time updates</p>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-brand-light-2 rounded-lg">
                    <div>
                      <p className="font-medium text-brand-text">Analytics Tracking</p>
                      <p className="text-xs text-brand-text-secondary">Track account performance</p>
                    </div>
                    <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-brand-text">Disconnect Account?</h3>
                  <p className="text-sm text-brand-text-secondary">
                    @{selectedAccount?.username}
                  </p>
                </div>
              </div>
              <p className="text-sm text-brand-text-secondary mb-6">
                This will remove all automation rules and data associated with this account. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(null)
                    // Handle disconnect
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Icon import for Zap (missing from imports)
function Zap({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}
