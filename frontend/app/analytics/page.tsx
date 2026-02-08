'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import AuthGuard from '@/components/AuthGuard'

export default function AnalyticsPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950">
        <AnalyticsDashboard />
      </div>
    </AuthGuard>
  )
}
