'use client'

import { ReactNode, useRef } from 'react'
import { motion } from 'framer-motion'

const _pulseGlow = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(0, 255, 136, 0.3)',
      '0 0 40px rgba(0, 255, 136, 0.6)',
      '0 0 20px rgba(0, 255, 136, 0.3)',
    ],
  },
  transition: { duration: 3, repeat: Infinity },
}

interface CyberButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CyberButton({
  children,
  onClick,
  disabled,
  variant = 'primary',
  size = 'md',
  className = '',
}: CyberButtonProps) {
  const baseClasses = 'font-mono font-bold transition-all duration-300 relative overflow-hidden rounded-lg'

  const variantClasses = {
    primary: 'bg-cyber-primary text-cyber-dark shadow-lg shadow-cyber-primary/40 hover:shadow-2xl hover:shadow-cyber-primary/70',
    secondary: 'bg-cyber-secondary text-white shadow-lg shadow-cyber-secondary/40 hover:shadow-2xl hover:shadow-cyber-secondary/70',
    ghost: 'border-2 border-cyber-primary text-cyber-primary hover:bg-cyber-primary/20 shadow-md shadow-cyber-primary/20',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
  }

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.05, boxShadow: '0 0 30px rgba(0, 255, 136, 0.6)' }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      disabled={disabled}
      onClick={onClick}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

export function CyberCard({
  children,
  className = '',
  glow = true,
}: {
  children: ReactNode
  className?: string
  glow?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={glow ? { boxShadow: '0 0 30px rgba(0, 255, 136, 0.3)' } : {}}
      transition={{ duration: 0.3 }}
      className={`glass-panel neon-border shadow-lg shadow-cyber-primary/20 ${glow ? 'hover:shadow-2xl' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}

export function CyberInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
}: {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  className?: string
}) {
  const ref = useRef<HTMLInputElement>(null)

  return (
    <motion.div className="w-full">
      {label && (
        <label className="block text-sm font-mono text-cyber-primary mb-2">
          {label}
        </label>
      )}
      <motion.input
        ref={ref}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        whileFocus={{ boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)' }}
        className={`
          w-full bg-cyber-dark border-2 border-cyber-primary/30 text-cyber-text
          rounded-lg px-4 py-2.5 font-mono text-sm
          focus:outline-none focus:border-cyber-primary focus:shadow-xl
          focus:shadow-cyber-primary/30 transition-all duration-300
          ${className}
        `}
      />
    </motion.div>
  )
}

export function CyberToggle({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean
  onChange: (value: boolean) => void
  label?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(!enabled)}
        className={`
          relative w-14 h-7 rounded-full transition-all duration-300
          ${enabled ? 'bg-cyber-primary shadow-lg shadow-cyber-primary/50' : 'bg-cyber-border shadow-md shadow-cyber-border/30'}
        `}
      >
        <motion.div
          initial={false}
          animate={{ x: enabled ? 28 : 4 }}
          className="absolute top-1 w-5 h-5 bg-cyber-dark rounded-full shadow-md"
        />
      </motion.button>
      {label && <span className="text-sm font-mono text-cyber-text">{label}</span>}
    </div>
  )
}

export function CyberScene({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="relative w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {children}
    </motion.div>
  )
}
