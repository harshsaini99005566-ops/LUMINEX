'use client'

import { useEffect, useState } from 'react'
import { Check, AlertCircle } from 'lucide-react'

interface Subscription {
  plan: string
  subscription?: {
    status: string
    currentPeriodEnd: string
  }
  usage?: {
    accountsUsed: number
    rulesUsed: number
    messagesThisMonth: number
  }
  limits?: {
    instagramAccounts: number
    automationRules: number
    monthlyMessages: number
  }
}

interface Plans {
  [key: string]: {
    name: string
    price: number
    features: string[]
  }
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<Plans>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBilling = async () => {
      const token = localStorage.getItem('token')
      try {
        const [subRes, plansRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/subscription`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/plans`),
        ])

        const subData = await subRes.json()
        const plansData = await plansRes.json()

        setSubscription(subData)
        setPlans(plansData.plans)
      } catch (error) {
        console.error('Error fetching billing:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBilling()
  }, [])

  const handleUpgrade = async (plan: string) => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error upgrading:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-brand-muted">Loading billing information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-brand-text mb-2">
          Billing & Plans
        </h1>
        <p className="text-brand-muted">Manage your subscription and usage</p>
      </div>

      {/* Current Plan */}
      {subscription?.plan && (
        <div className="card mb-8 bg-brand-primary/5 border-brand-primary/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-brand-muted text-sm mb-2">Current Plan</p>
              <p className="text-2xl font-heading font-bold text-brand-primary capitalize">
                {subscription.plan}
              </p>
            </div>
            <div>
              <p className="text-brand-muted text-sm mb-2">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-brand-success rounded-full" />
                <p className="text-lg font-heading font-semibold text-brand-text capitalize">
                  {subscription.subscription?.status || 'Active'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-brand-muted text-sm mb-2">Renews</p>
              <p className="text-lg font-heading font-semibold text-brand-text">
                {subscription.subscription?.currentPeriodEnd
                  ? new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-heading font-bold text-brand-text mb-6">
          Upgrade Your Plan
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(plans).map(([key, plan]: any) => (
            <div
              key={key}
              className={`card ${
                subscription?.plan === key
                  ? 'ring-2 ring-brand-primary bg-brand-primary/5'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-heading font-semibold text-brand-text capitalize">
                  {key}
                </h3>
                {subscription?.plan === key && (
                  <div className="bg-brand-primary text-white text-xs font-semibold px-2 py-1 rounded-full">
                    Current
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-3xl font-heading font-bold text-brand-primary">
                    ${plan.price}
                  </span>
                  <span className="text-brand-muted text-sm ml-1">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features ? (
                  plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-brand-text">
                      <Check className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-2 text-sm text-brand-text">
                      <Check className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                      <span>{plan.limits?.instagramAccounts} Account(s)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-brand-text">
                      <Check className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                      <span>{plan.limits?.automationRules} Rules</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-brand-text">
                      <Check className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                      <span>
                        {(plan.limits?.monthlyMessages / 1000).toFixed(0)}K Messages/month
                      </span>
                    </li>
                  </>
                )}
              </ul>

              {subscription?.plan === key ? (
                <button
                  disabled
                  className="btn-secondary w-full opacity-50 cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(key)}
                  className={plan.price === 0 ? 'btn-secondary w-full' : 'btn-primary w-full'}
                >
                  {plan.price === 0 ? 'Downgrade to Free' : 'Upgrade Plan'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Usage Info */}
      {subscription && (
        <div className="card">
          <h2 className="text-lg font-heading font-semibold text-brand-text mb-6">
            Your Usage
          </h2>

          <div className="space-y-4">
            {[
              {
                label: 'Instagram Accounts',
                used: subscription.usage?.accountsUsed || 0,
                limit: subscription.limits?.instagramAccounts || 0,
              },
              {
                label: 'Automation Rules',
                used: subscription.usage?.rulesUsed || 0,
                limit: subscription.limits?.automationRules || 0,
              },
              {
                label: 'Messages This Month',
                used: subscription.usage?.messagesThisMonth || 0,
                limit: subscription.limits?.monthlyMessages || 0,
              },
            ].map((item) => {
              const percentage = (item.used / item.limit) * 100
              const isWarning = percentage > 80

              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-brand-text text-sm">{item.label}</span>
                    <span className={`text-sm font-semibold ${isWarning ? 'text-brand-error' : 'text-brand-primary'}`}>
                      {item.used.toLocaleString()} / {item.limit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-brand-light rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isWarning ? 'bg-brand-error' : 'bg-brand-primary'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {subscription.usage && subscription.usage.messagesThisMonth > (subscription.limits?.monthlyMessages || 1) * 0.8 && (
            <div className="mt-6 flex gap-3 p-4 bg-brand-warning/10 border border-brand-warning rounded-[10px]">
              <AlertCircle className="w-5 h-5 text-brand-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-brand-warning text-sm mb-1">Approaching Limit</p>
                <p className="text-brand-muted text-xs">
                  You're using over 80% of your monthly message limit. Consider upgrading your plan.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FAQ */}
      <div className="card mt-8">
        <h2 className="text-lg font-heading font-semibold text-brand-text mb-6">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {[
            {
              question: 'Can I change my plan anytime?',
              answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
            },
            {
              question: 'Do you offer refunds?',
              answer: 'We offer a 7-day money-back guarantee on all new subscriptions. After that, monthly plans are not refundable.',
            },
            {
              question: 'What happens if I exceed my limits?',
              answer: 'Your automation will stop working once you exceed your message limit. Upgrade your plan to continue.',
            },
          ].map((faq, i) => (
            <div key={i} className="border-b border-brand-border last:border-b-0 pb-4 last:pb-0">
              <p className="font-semibold text-brand-text text-sm mb-2">{faq.question}</p>
              <p className="text-brand-muted text-sm">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
