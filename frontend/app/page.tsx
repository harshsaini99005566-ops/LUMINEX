'use client'

import { useState as _useState } from 'react'
import Link from 'next/link'
import { MessageCircle, Zap, BarChart3, Shield, Users, Settings, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-light overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold font-heading">
            <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              AutoDM
            </span>
          </div>
          <div className="flex gap-3 items-center">
            <Link href="/login">
              <button className="btn-ghost text-sm hover:text-brand-primary">Login</button>
            </Link>
            <Link href="/signup">
              <button className="btn-primary text-sm">Start Free Trial</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        {/* Background gradient accent */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-primary-50 to-brand-secondary-50 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-20 -left-40 w-80 h-80 bg-gradient-to-tr from-brand-accent-50 to-brand-primary-50 rounded-full blur-3xl opacity-30" />

        <div className="max-w-4xl mx-auto text-left relative z-10">
          <div className="inline-block mb-6 px-4 py-2 rounded-full bg-brand-primary-50 border border-brand-primary-100">
            <span className="text-sm font-medium text-brand-primary">🚀 Introducing AutoDM Pro</span>
          </div>

          <h1 className="text-6xl font-heading font-bold mb-8 text-brand-text max-w-3xl leading-tight">
            Automate Instagram DMs & Comments with AI
          </h1>

          <p className="text-xl text-brand-text-secondary mb-10 max-w-2xl leading-relaxed font-medium">
            Connect your Instagram account, set up smart rules, and let AI handle repetitive messages. Save hours every week while staying authentic.
          </p>

          <div className="flex gap-4 flex-wrap">
            <Link href="/signup">
              <button className="btn-primary flex items-center gap-2 text-base px-6 py-3 hover:shadow-primary hover:scale-105 active:scale-95">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="#features">
              <button className="btn-secondary text-base px-6 py-3 hover:shadow-md">Learn More</button>
            </Link>
          </div>

          <p className="text-sm text-brand-muted mt-8">
            ✓ No credit card required &nbsp;&nbsp;•&nbsp;&nbsp; Free tier: 1 account, 5 rules &nbsp;&nbsp;•&nbsp;&nbsp; Setup in 5 minutes
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-heading font-bold text-brand-text mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-brand-text-secondary max-w-2xl mx-auto">
              Everything you need to automate Instagram conversations intelligently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageCircle,
                title: 'Smart Message Routing',
                desc: 'Use AI to auto-reply to messages or route complex ones to your team',
                color: 'brand-primary',
              },
              {
                icon: Zap,
                title: 'Fast Setup',
                desc: 'Connect your account and create rules in minutes. No coding required.',
                color: 'brand-secondary',
              },
              {
                icon: BarChart3,
                title: 'Real-time Analytics',
                desc: 'Track engagement metrics, response times, and automation performance.',
                color: 'brand-accent',
              },
              {
                icon: Shield,
                title: 'Safe & Secure',
                desc: 'Your data is encrypted. We never store Instagram credentials.',
                color: 'brand-primary',
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                desc: 'Add team members and manage multiple accounts from one dashboard.',
                color: 'brand-secondary',
              },
              {
                icon: Settings,
                title: 'Customizable Rules',
                desc: 'Create unlimited automation rules based on keywords, hashtags, or users.',
                color: 'brand-accent',
              },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={i} className="card-elevated group hover:shadow-lg cursor-pointer">
                  <div className={`w-12 h-12 rounded-lg bg-${feature.color}-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 text-${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-brand-text mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-brand-text-secondary leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 bg-brand-light">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-heading font-bold text-brand-text mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-brand-text-secondary max-w-2xl mx-auto">
              Scale your automation as your business grows. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                name: 'Free',
                price: '$0',
                accounts: '1 Account',
                rules: '5 Rules',
                messages: '1K messages/mo',
              },
              {
                name: 'Starter',
                price: '$29',
                accounts: '3 Accounts',
                rules: '25 Rules',
                messages: '10K messages/mo',
                popular: true,
              },
              {
                name: 'Pro',
                price: '$99',
                accounts: '10 Accounts',
                rules: '100 Rules',
                messages: '100K messages/mo',
              },
              {
                name: 'Agency',
                price: '$299',
                accounts: '50 Accounts',
                rules: '500 Rules',
                messages: '1M messages/mo',
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`card-elevated relative overflow-hidden group hover:shadow-xl transition-shadow ${
                  plan.popular ? 'ring-2 ring-brand-primary scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-heading font-bold text-brand-text mb-4">
                  {plan.name}
                </h3>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-brand-primary">{plan.price}</span>
                  <span className="text-brand-text-secondary text-sm">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {[plan.accounts, plan.rules, plan.messages].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-brand-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-brand-primary font-bold text-sm">✓</span>
                      </div>
                      <span className="text-brand-text-secondary">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block w-full">
                  <button
                    className={`w-full text-sm font-semibold py-3 rounded-lg transition-all duration-250 ${
                      plan.popular
                        ? 'btn-primary hover:shadow-primary'
                        : 'btn-secondary hover:bg-brand-primary-50'
                    }`}
                  >
                    Get Started
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-heading font-bold text-brand-text mb-4">
              Loved by Creators & Agencies
            </h2>
            <p className="text-xl text-brand-text-secondary">Join hundreds of happy users</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: 'Saved me 5 hours a week. The automation is intelligent and feels personal.',
                author: 'Sarah Chen',
                role: 'Content Creator',
                rating: 5,
              },
              {
                quote: 'Our team manages 15 accounts. This tool is a game-changer for scaling.',
                author: 'Marcus Johnson',
                role: 'Social Media Agency',
                rating: 5,
              },
              {
                quote: 'Simple to set up, powerful in action. Exactly what we needed.',
                author: 'Emily Rodriguez',
                role: 'Founder, DM Coach',
                rating: 5,
              },
            ].map((testimonial, i) => (
              <div key={i} className="card-elevated group hover:shadow-lg">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, idx) => (
                    <span key={idx} className="text-yellow-400">⭐</span>
                  ))}
                </div>
                <p className="text-brand-text mb-6 italic leading-relaxed text-lg">
                  "{testimonial.quote}"
                </p>
                <div className="pt-4 border-t border-brand-border">
                  <p className="font-semibold text-brand-text">
                    {testimonial.author}
                  </p>
                  <p className="text-brand-muted text-sm">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary-50 to-brand-secondary-50 opacity-60" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-5xl font-heading font-bold text-brand-text mb-6">
            Ready to automate your Instagram?
          </h2>
          <p className="text-xl text-brand-text-secondary mb-10">
            Join hundreds of creators and agencies saving time with smart automation.
          </p>
          <Link href="/signup">
            <button className="btn-primary text-lg px-10 py-4 hover:shadow-primary hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto">
              Start Your Free Trial Today
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-border py-12 px-6 text-center text-sm text-brand-muted bg-white">
        <p>© 2024 AutoDM. Built with ❤️ for creators everywhere.</p>
      </footer>
    </div>
  )
}
