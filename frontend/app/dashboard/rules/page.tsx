'use client'

import { useState } from 'react'
import { CyberButton, CyberCard, CyberInput as _CyberInput } from '@/components/CyberUI'
import { RuleBuilder } from '@/components/RuleBuilder'
import { CyberGrid } from '@/components/CyberGrid'
import Link from 'next/link'

export default function RulesPage() {
  const [view, setView] = useState('list') // 'list' or 'create'
  const [rules, _setRules] = useState([])

  return (
    <div className="min-h-screen bg-cyber-dark text-cyber-text">
      <CyberGrid />

      {/* Header */}
      <header className="glass-panel border-b border-cyber-primary/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cyber-primary font-mono">RULE ENGINE</h1>
            <p className="text-sm text-cyber-text/60">Define automation logic</p>
          </div>
          <Link href="/dashboard">
            <CyberButton variant="ghost">← Back</CyberButton>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {view === 'list' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-cyber-primary font-mono">Your Rules</h2>
              <CyberButton onClick={() => setView('create')} variant="primary">
                + Create Rule
              </CyberButton>
            </div>

            {rules.length === 0 ? (
              <CyberCard className="p-12 text-center">
                <p className="text-cyber-text/60 mb-6">No rules created yet.</p>
                <CyberButton onClick={() => setView('create')} variant="primary">
                  Create Your First Rule
                </CyberButton>
              </CyberCard>
            ) : (
              <div className="space-y-4">
                {/* Rules list will go here */}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <CyberButton onClick={() => setView('list')} variant="ghost">
                ← Back to Rules
              </CyberButton>
            </div>
            <RuleBuilder />
          </div>
        )}
      </main>
    </div>
  )
}
