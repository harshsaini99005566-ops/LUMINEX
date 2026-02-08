'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CyberButton, CyberCard, CyberInput, CyberToggle } from '@/components/CyberUI'

export function RuleBuilder() {
  const [step, setStep] = useState(1)
  const [ruleName, setRuleName] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [keyword, setKeyword] = useState('')
  const [replyType, setReplyType] = useState('predefined')
  const [reply, setReply] = useState('')
  const [useAI, setUseAI] = useState(false)

  const steps = [
    { num: 1, title: 'Rule Details' },
    { num: 2, title: 'Keywords' },
    { num: 3, title: 'Response' },
    { num: 4, title: 'Review' },
  ]

  const addKeyword = () => {
    if (keyword && !keywords.includes(keyword)) {
      setKeywords([...keywords, keyword])
      setKeyword('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex gap-4">
        {steps.map((s) => (
          <motion.div
            key={s.num}
            whileHover={{ scale: 1.05 }}
            onClick={() => setStep(s.num)}
            className={`
              flex-1 p-3 text-center font-mono rounded-lg cursor-pointer
              transition-all duration-300
              ${step === s.num
                ? 'bg-cyber-primary text-cyber-dark neon-glow'
                : 'glass-panel neon-border text-cyber-text'
              }
            `}
          >
            <div className="text-lg font-bold">{s.num}</div>
            <div className="text-xs">{s.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Step Content */}
      <CyberCard className="p-8 min-h-80">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-cyber-primary">Rule Details</h2>
            <CyberInput
              label="Rule Name"
              value={ruleName}
              onChange={setRuleName}
              placeholder="e.g., Welcome Message"
            />
            <div className="flex gap-4">
              {['keyword', 'mention', 'comment'].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="trigger"
                    value={type}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-mono text-cyber-text capitalize">{type}</span>
                </label>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-cyber-primary">Keywords</h2>
            <div className="flex gap-2">
              <CyberInput
                value={keyword}
                onChange={setKeyword}
                placeholder="Add a keyword..."
              />
              <CyberButton onClick={addKeyword} size="md">
                Add
              </CyberButton>
            </div>

            {/* Keyword Cloud */}
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw) => (
                <motion.div
                  key={kw}
                  whileHover={{ scale: 1.1 }}
                  className="px-4 py-2 bg-cyber-primary/20 border border-cyber-primary rounded-full text-sm font-mono text-cyber-primary cursor-pointer hover:bg-cyber-primary/40 transition-colors"
                  onClick={() => setKeywords(keywords.filter((k) => k !== kw))}
                >
                  {kw} ✕
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-cyber-primary">Response Type</h2>

            <div className="space-y-4">
              {['predefined', 'ai', 'handoff'].map((type) => (
                <label key={type} className="flex items-start gap-3 p-4 glass-panel neon-border cursor-pointer hover:border-cyber-primary transition-all">
                  <input
                    type="radio"
                    name="replyType"
                    value={type}
                    checked={replyType === type}
                    onChange={(e) => setReplyType(e.target.value)}
                    className="w-4 h-4 mt-1"
                  />
                  <div>
                    <div className="font-mono font-bold text-cyber-primary capitalize">{type}</div>
                    <div className="text-xs text-cyber-text/60 mt-1">
                      {type === 'predefined' && 'Use a pre-written message'}
                      {type === 'ai' && 'Generate replies with AI'}
                      {type === 'handoff' && 'Send to team for manual reply'}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {replyType === 'predefined' && (
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Your reply message..."
                className="w-full bg-cyber-dark border border-cyber-primary/30 text-cyber-text rounded-lg px-4 py-3 font-mono text-sm focus:border-cyber-primary focus:outline-none"
                rows={4}
              />
            )}

            {replyType === 'ai' && (
              <div className="space-y-3">
                <CyberToggle enabled={useAI} onChange={setUseAI} label="Enable AI Replies" />
                <textarea
                  placeholder="AI personality/instructions..."
                  className="w-full bg-cyber-dark border border-cyber-primary/30 text-cyber-text rounded-lg px-4 py-3 font-mono text-sm focus:border-cyber-primary focus:outline-none"
                  rows={3}
                />
              </div>
            )}
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-cyber-primary">Review Rule</h2>
            <div className="space-y-3 font-mono text-sm">
              <div className="p-3 glass-panel">
                <span className="text-cyber-primary">Rule Name:</span> {ruleName}
              </div>
              <div className="p-3 glass-panel">
                <span className="text-cyber-primary">Keywords:</span> {keywords.join(', ')}
              </div>
              <div className="p-3 glass-panel">
                <span className="text-cyber-primary">Type:</span> {replyType}
              </div>
            </div>
          </motion.div>
        )}
      </CyberCard>

      {/* Navigation */}
      <div className="flex gap-4 justify-between">
        <CyberButton
          onClick={() => setStep(Math.max(1, step - 1))}
          variant="ghost"
          disabled={step === 1}
        >
          ← Previous
        </CyberButton>
        {step < 4 && (
          <CyberButton
            onClick={() => setStep(Math.min(4, step + 1))}
            variant="primary"
          >
            Next →
          </CyberButton>
        )}
        {step === 4 && (
          <CyberButton variant="primary">
            Create Rule
          </CyberButton>
        )}
      </div>
    </div>
  )
}
