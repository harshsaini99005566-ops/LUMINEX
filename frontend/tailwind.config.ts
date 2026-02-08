import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Primary violet gradient colors
          primary: '#6C63FF',
          'primary-light': '#8B84FF',
          'primary-dark': '#5451E6',
          'primary-50': '#F5F3FF',
          'primary-100': '#EBE7FF',
          
          // Secondary blue
          secondary: '#3B82F6',
          'secondary-light': '#60A5FA',
          'secondary-dark': '#1E40AF',
          'secondary-50': '#EFF6FF',
          'secondary-100': '#DBEAFE',
          
          // Accent teal
          accent: '#06B6D4',
          'accent-light': '#22D3EE',
          'accent-dark': '#0891B2',
          'accent-50': '#ECFDF5',
          'accent-100': '#CCFBF1',
          
          // Neutral colors
          light: '#F9FAFB',
          'light-2': '#F3F4F6',
          card: '#FFFFFF',
          text: '#111827',
          'text-secondary': '#374151',
          muted: '#6B7280',
          'muted-light': '#9CA3AF',
          border: '#E5E7EB',
          'border-light': '#F3F4F6',
          
          // Status colors
          error: '#EF4444',
          'error-light': '#FCA5A5',
          'error-50': '#FEF2F2',
          success: '#10B981',
          'success-light': '#6EE7B7',
          'success-50': '#ECFDF5',
          warning: '#F59E0B',
          'warning-light': '#FCD34D',
          'warning-50': '#FFFBEB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '1.5' }],
        'sm': ['14px', { lineHeight: '1.5' }],
        'base': ['16px', { lineHeight: '1.6' }],
        'lg': ['18px', { lineHeight: '1.6' }],
        'xl': ['20px', { lineHeight: '1.6' }],
        '2xl': ['24px', { lineHeight: '1.4' }],
        '3xl': ['30px', { lineHeight: '1.3' }],
        '4xl': ['36px', { lineHeight: '1.2' }],
      },
      letterSpacing: {
        tight: '-0.01em',
        normal: '0em',
        wide: '0.025em',
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out',
        slideUp: 'slideUp 0.4s ease-out',
        slideDown: 'slideDown 0.3s ease-out',
        slideInLeft: 'slideInLeft 0.3s ease-out',
        scaleIn: 'scaleIn 0.3s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-12px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        'hover': '0 8px 16px rgba(108, 99, 255, 0.12)',
        'focus': '0 0 0 3px rgba(108, 99, 255, 0.1)',
        'primary': '0 4px 20px rgba(108, 99, 255, 0.15)',
      },
      borderRadius: {
        'xs': '6px',
        'sm': '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '14px',
        '2xl': '16px',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
    },
  },
  plugins: [],
}

export default config
