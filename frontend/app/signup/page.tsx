'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'

import { authAPI } from '../../lib/api'

interface SignupErrors {
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  general?: string
}

function validateForm(email: string, password: string, firstName: string, lastName: string): SignupErrors {
  const errors: SignupErrors = {}

  if (!firstName.trim()) {
    errors.firstName = 'First name is required'
  }

  if (!lastName.trim()) {
    errors.lastName = 'Last name is required'
  }

  if (!email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address'
  }

  if (!password) {
    errors.password = 'Password is required'
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters long'
  }

  return errors
}

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<SignupErrors>({})
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage('')

    const validationErrors = validateForm(email, password, firstName, lastName)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      const data = await authAPI.register(email, password, firstName, lastName)

      if (data && data.token) {
        setSuccessMessage('Account created successfully!')
        localStorage.setItem('token', data.token)
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
        }
        // Use SPA navigation to avoid remount loops
        setTimeout(() => {
          router.push('/dashboard')
        }, 800)
      } else {
        const errorMessage = typeof data.error === 'string' ? data.error : (data.error?.message || 'Failed to create account')
        setErrors({ general: errorMessage })
      }
    } catch (error: any) {
      // Extract error message from axios error response
      let errorMessage = 'Network error. Please check your connection.'
      
      if (error.response?.data?.error) {
        // Backend returned an error message
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setErrors({ general: errorMessage })
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
          <p className="text-lg text-brand-text-secondary font-medium">Join thousands of creators</p>
          <p className="text-sm text-brand-muted mt-2">Get started free, no credit card required</p>
        </div>

        <div className="card-elevated shadow-lg border-none">
          <form onSubmit={handleSignup} className="space-y-6">
            {errors.general && (
              <div className="flex gap-3 p-4 bg-brand-error-50 border border-brand-error-light rounded-lg animate-slideDown">
                <AlertCircle className="w-5 h-5 text-brand-error flex-shrink-0 mt-0.5" />
                <p className="text-brand-error text-sm font-medium">{errors.general}</p>
              </div>
            )}

            {successMessage && (
              <div className="flex gap-3 p-4 bg-brand-success-50 border border-brand-success rounded-lg animate-slideDown">
                <CheckCircle className="w-5 h-5 text-brand-success flex-shrink-0 mt-0.5" />
                <p className="text-brand-success text-sm font-medium">{successMessage}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-brand-text mb-2.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="input"
                  required
                  autoComplete="given-name"
                />
                {errors.firstName && (
                  <p className="text-brand-error text-xs mt-1.5 font-medium">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-text mb-2.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="input"
                  required
                  autoComplete="family-name"
                />
                {errors.lastName && (
                  <p className="text-brand-error text-xs mt-1.5 font-medium">{errors.lastName}</p>
                )}
              </div>
            </div>

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
              {errors.email && (
                <p className="text-brand-error text-xs mt-1.5 font-medium">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-text mb-2.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pr-12"
                  required
                  autoComplete="new-password"
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
              {errors.password && (
                <p className="text-brand-error text-xs mt-1.5 font-medium">{errors.password}</p>
              )}
              <p className="text-brand-muted text-xs mt-1.5">Minimum 8 characters, mix of letters and numbers</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base font-semibold py-3 hover:shadow-primary hover:scale-105 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
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

          <p className="text-center text-sm text-brand-muted mt-8">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-primary font-semibold hover:text-brand-primary-dark transition-colors">
              Sign in here
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-brand-muted mt-8">
          By creating an account, you agree to our{' '}
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
