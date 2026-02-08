'use client'

import { useEffect, useState } from 'react'
import { User, Bell, LogOut, Trash2, Lock } from 'lucide-react'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setUser(data.user)
        setFirstName(data.user.firstName || '')
        setLastName(data.user.lastName || '')
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName, lastName }),
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-brand-muted">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-brand-text mb-2">
          Settings
        </h1>
        <p className="text-brand-muted">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Section */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-brand-primary" />
              </div>
              <h2 className="text-lg font-heading font-semibold text-brand-text">
                Profile Information
              </h2>
            </div>

            {saved && (
              <div className="mb-4 p-3 bg-brand-success/10 border border-brand-success rounded-[10px] text-brand-success text-sm">
                ✓ Profile updated successfully
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-text mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-text mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input opacity-60 cursor-not-allowed"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                className="btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-brand-primary" />
              </div>
              <h2 className="text-lg font-heading font-semibold text-brand-text">
                Notifications
              </h2>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Email Notifications', enabled: emailNotifications, onChange: setEmailNotifications },
                { label: 'Weekly Report', enabled: true, onChange: () => {} },
                { label: 'Marketing Emails', enabled: false, onChange: () => {} },
              ].map((pref) => (
                <div
                  key={pref.label}
                  className="flex items-center justify-between p-3 bg-brand-light rounded-[10px]"
                >
                  <span className="text-sm font-medium text-brand-text">{pref.label}</span>
                  <button
                    onClick={() => pref.onChange(!pref.enabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      pref.enabled ? 'bg-brand-primary' : 'bg-brand-border'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        pref.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card border-brand-error/20 bg-brand-error/5">
            <h2 className="text-lg font-heading font-semibold text-brand-text mb-4">
              Danger Zone
            </h2>
            <p className="text-sm text-brand-muted mb-4">
              These actions are permanent and cannot be undone.
            </p>
            <div className="space-y-2">
              <button className="btn-secondary w-full text-left flex items-center gap-2 justify-center">
                <Lock className="w-4 h-4" />
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="btn-secondary w-full text-left flex items-center gap-2 justify-center text-brand-error"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
              <button className="btn-secondary w-full text-left flex items-center gap-2 justify-center text-brand-error">
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Info */}
          <div className="card">
            <h3 className="font-heading font-semibold text-brand-text mb-4">Account Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-brand-muted mb-1">Plan</p>
                <p className="font-semibold text-brand-primary capitalize">
                  {user?.plan || 'Free'}
                </p>
              </div>
              <div>
                <p className="text-xs text-brand-muted mb-1">Created</p>
                <p className="font-medium text-brand-text text-sm">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="card">
            <h3 className="font-heading font-semibold text-brand-text mb-4">Quick Links</h3>
            <div className="space-y-2">
              <a href="/dashboard/billing" className="block p-2 rounded-[8px] hover:bg-brand-light text-sm text-brand-primary font-medium">
                → Manage Billing
              </a>
              <a href="/dashboard/accounts" className="block p-2 rounded-[8px] hover:bg-brand-light text-sm text-brand-primary font-medium">
                → Connected Accounts
              </a>
              <a href="/dashboard" className="block p-2 rounded-[8px] hover:bg-brand-light text-sm text-brand-primary font-medium">
                → Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
