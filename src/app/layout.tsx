import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { ClientProviders } from '@/components/providers/ClientProviders'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '🐘 Contentlynk | Where Creators Actually Get Paid',
  description: '55-75% revenue share vs traditional 0-5%. Zero follower minimums. Immediate earnings from day one. Beta Q2 2026 • 1,000 spots.',
  keywords: ['creator economy', 'content monetization', 'fair creator pay', 'web3 social media', 'creator platform', 'revenue share', 'HVNA token'],
  authors: [{ name: 'Contentlynk' }],
  icons: {
    icon: [
      { url: '/images/contentlynk-logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/contentlynk-logo.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/images/contentlynk-logo.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/images/contentlynk-logo.png', color: '#FF6B35' },
    ],
  },
  themeColor: '#FF6B35',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://contentlynk.com',
    siteName: 'Contentlynk',
    title: '🐘 Contentlynk | Where Creators Actually Get Paid',
    description: 'Get paid from day one. 55-75% revenue share vs traditional 0-5%. Zero follower minimums. Immediate earnings. Beta launch Q2 2026 • 1,000 founding creator spots available.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Contentlynk - 55-75% Revenue Share • Zero Minimums • Immediate Earnings',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '🐘 Contentlynk | Where Creators Actually Get Paid',
    description: '55-75% revenue share vs traditional 0-5%. Zero follower minimums. Immediate earnings from day one. Beta Q2 2026 • 1,000 spots.',
    images: ['/images/og-image.png'],
    creator: '@havanaelephant',
    site: '@havanaelephant',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script
          id="microsoft-clarity"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "u2wk6vqgio");
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}