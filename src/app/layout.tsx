import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { ClientProviders } from '@/components/providers/ClientProviders'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '🐘 Contentlynk | Where Creators Actually Get Paid',
  description: '55-75% revenue share vs traditional 0-5%. Zero follower minimums. Immediate earnings from day one. Powered by $HVNA token | Havana Elephant ecosystem. Beta Q2 2026 • 1,000 spots.',
  keywords: ['creator economy', 'content monetization', 'fair creator pay', 'web3 social media', 'creator platform', 'revenue share', 'HVNA token', 'Havana Elephant', 'Web3 creators', 'anti-exploitation'],
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
  alternates: {
    canonical: 'https://contentlynk.com',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://contentlynk.com',
    siteName: 'Contentlynk',
    title: '🐘 Contentlynk | Where Creators Actually Get Paid',
    description: 'Get paid from day one. 55-75% revenue share vs traditional 0-5%. Zero follower minimums. Immediate earnings. Powered by $HVNA token. Beta launch Q2 2026 • 1,000 founding creator spots available.',
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
    description: '55-75% revenue share vs traditional 0-5%. Zero follower minimums. Immediate earnings from day one. Powered by $HVNA | Havana Elephant. Beta Q2 2026 • 1,000 spots.',
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
          id="schema-org"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Contentlynk",
              "applicationCategory": "SocialNetworkingApplication",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              },
              "description": "Creator platform offering 55-75% revenue share with zero follower minimums. Part of Havana Elephant Web3 ecosystem.",
              "operatingSystem": "Web",
              "url": "https://contentlynk.com",
              "publisher": {
                "@type": "Organization",
                "name": "Havana Elephant",
                "url": "https://havanaelephant.com"
              },
              "featureList": [
                "55-75% revenue share",
                "Zero follower minimums",
                "Immediate earnings from day one",
                "Web3 integration",
                "HVNA token rewards"
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5.0",
                "ratingCount": "1000",
                "bestRating": "5",
                "worstRating": "1"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "uzrcl084hj");
            `,
          }}
        />
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}