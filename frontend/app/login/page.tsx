'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { authAPI } from '../../lib/api'


export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await authAPI.login(email, password)

      if (data && data.token) {
        // Store token locally for compatibility with non-cookie flows
        localStorage.setItem('token', data.token)
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
        }

        // Use SPA navigation to avoid remount loops
        setTimeout(() => {
          router.push('/dashboard')
        }, 300)
      } else {
        const errorMessage = typeof data.error === 'string' ? data.error : 'Login failed'
        setError(errorMessage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      const suggestion = `Network error. Ensure backend is running at ${process.env.NEXT_PUBLIC_API_URL} and CORS allows requests from this origin.`;
      setError(errorMessage ? `${errorMessage} — ${suggestion}` : suggestion);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-primary-50 to-brand-secondary-50 rounded-full blur-3xl opacity-40" />
      <div className="absolute -bottom-20 -left-40 w-60 h-60 bg-gradient-to-tr from-brand-accent-50 to-brand-primary-50 rounded-full blur-3xl opacity-30" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link href="/">
            <h1 className="text-3xl font-heading font-bold mb-3">
              <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                AutoDM
              </span>
            </h1>
          </Link>
          <p className="text-lg text-brand-text-secondary font-medium">Welcome back to AutoDM</p>
          <p className="text-sm text-brand-muted mt-2">Sign in to your account to continue</p>
        </div>

        <div className="card-elevated shadow-lg border-none">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="flex gap-3 p-4 bg-brand-error-50 border border-brand-error-light rounded-lg animate-slideDown">
                <AlertCircle className="w-5 h-5 text-brand-error flex-shrink-0 mt-0.5" />
                <p className="text-brand-error text-sm font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-brand-text mb-2.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="block text-sm font-semibold text-brand-text">
                  Password
                </label>
                <Link href="#" className="text-xs text-brand-primary hover:text-brand-primary-dark font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pr-12"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base font-semibold py-3 hover:shadow-primary hover:scale-105 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-brand-muted">Or</span>
            </div>
          </div>

          {/* Facebook Login Button */}
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => window.location.href = '/api/auth/facebook'}
              className="btn-secondary w-full text-base font-semibold py-3 flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" fill="currentColor" className="text-blue-600" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
              Continue with Facebook
            </button>
          </div>

          <p className="text-center text-sm text-brand-muted mt-8">
            Don&apos;t have an account? 
            <Link href="/signup" className="text-brand-primary font-semibold hover:text-brand-primary-dark transition-colors">
              Create one free
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-brand-muted mt-8">
          By signing in, you agree to our{' '}
          <Link href="#" className="text-brand-primary hover:underline">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link href="#" className="text-brand-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
