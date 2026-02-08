"use client"

import React from 'react'
import Link from 'next/link'
import { LogOut, LayoutDashboard, Zap, MessageCircle, Settings, BarChart3, ChevronDown as _ChevronDown } from 'lucide-react' 
import AuthGuard from '../../components/AuthGuard'
import { useState, useEffect } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [currentPath, setCurrentPath] = useState('')

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
    setCurrentPath(window.location.pathname)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/inbox', label: 'Inbox', icon: MessageCircle },
    { href: '/dashboard/rules', label: 'Automations', icon: Zap },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <AuthGuard>
      <div className="min-h-screen flex bg-brand-light">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-brand-border flex flex-col shadow-sm">
          <div className="p-6 border-b border-brand-border">
            <Link href="/dashboard">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <h1 className="text-lg font-heading font-bold text-brand-text">
                    AutoDM
                  </h1>
                  <p className="text-xs text-brand-muted">Pro</p>
                </div>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPath === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                    isActive
                      ? 'bg-brand-primary-100 text-brand-primary'
                      : 'text-brand-text hover:bg-brand-light-2'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                  {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-brand-primary" />}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-brand-border space-y-3">
            <div className="px-4 py-3 bg-brand-primary-50 rounded-lg border border-brand-primary-100">
              <p className="text-xs text-brand-muted font-medium mb-1">Free Tier</p>
              <p className="text-sm font-semibold text-brand-text">1 of 5 Rules Used</p>
              <div className="mt-2 w-full bg-brand-border rounded-full h-2">
                <div className="bg-gradient-to-r from-brand-primary to-brand-secondary h-2 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-brand-text hover:bg-brand-light-2 rounded-lg transition-all duration-200 text-sm font-medium hover:text-brand-primary"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Top Navigation Bar */}
          <div className="h-16 bg-white border-b border-brand-border flex items-center justify-between px-8 shadow-sm">
            <div className="flex-1">
              <h2 className="text-base font-semibold text-brand-text">
                Welcome back, {user?.firstName || 'User'}! 👋
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-brand-light rounded-lg transition-colors">
                <svg className="w-5 h-5 text-brand-muted" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="w-px h-6 bg-brand-border" />
              <button className="flex items-center gap-2 px-3 py-2 hover:bg-brand-light rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white text-sm font-bold">
                  {user?.firstName?.[0] || 'U'}
                </div>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
