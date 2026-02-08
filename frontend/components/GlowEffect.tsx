'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface GlowEffectProps {
  children: ReactNode
  intensity?: 'low' | 'medium' | 'high'
  color?: 'primary' | 'secondary' | 'accent1'
  className?: string
  animated?: boolean
}

export function GlowEffect({
  children,
  intensity = 'medium',
  color = 'primary',
  className = '',
  animated = true,
}: GlowEffectProps) {
  const intensityMap = {
    low: '0 0 15px',
    medium: '0 0 25px',
    high: '0 0 40px',
  }

  const colorMap = {
    primary: 'rgba(0, 255, 136, 0.4)',
    secondary: 'rgba(255, 0, 136, 0.4)',
    accent1: 'rgba(0, 136, 255, 0.4)',
  }

  const baseBoxShadow = `${intensityMap[intensity]} ${colorMap[color]}`

  const glowVariants = {
    rest: { boxShadow: baseBoxShadow },
    hover: {
      boxShadow: [
        baseBoxShadow,
        `${intensityMap[intensity]} ${colorMap[color].replace('0.4', '0.7')}`,
        baseBoxShadow,
      ],
    },
  }

  return (
    <motion.div
      whileHover={animated ? 'hover' : 'rest'}
      initial="rest"
      variants={glowVariants}
      transition={{ duration: 0.6 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function ScanlineOverlay() {
  return (
    <motion.div
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
      animate={{
        backgroundPosition: ['0px 0px', '0px 10px'],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        background: 'repeating-linear-gradient(0deg, rgba(0, 255, 136, 0.02), rgba(0, 255, 136, 0.02) 1px, transparent 1px, transparent 2px)',
        backgroundSize: '100% 10px',
      }}
    />
  )
}
