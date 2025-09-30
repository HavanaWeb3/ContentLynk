import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClientProviders } from '@/components/providers/ClientProviders'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Contentlynk - Creator Economy Reimagined',
  description: 'The first social platform that pays creators from day one. Zero follower minimums, transparent earnings, powered by $HVNA.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}