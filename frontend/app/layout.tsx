import type { Metadata } from 'next'
import './globals.css'
import { Inter, Poppins } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'LUMINEX - Instagram DM & Comment Automation',
  description: 'Enterprise-grade Instagram automation for agencies and creators',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="bg-brand-light text-brand-text font-sans">{children}</body>
    </html>
  )
} 
