import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { ClientProviders } from '@/components/providers/ClientProviders'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Contentlynk - Creator Economy Reimagined',
  description: 'The first social platform that pays creators from day one. Zero follower minimums, transparent earnings, powered by $HVNA.',
  icons: {
    icon: [
      { url: '/images/contentlynk-logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/contentlynk-logo.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/images/contentlynk-logo.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/images/contentlynk-logo.png', color: '#4f46e5' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://contentlynk.com',
    siteName: 'Contentlynk',
    title: 'Contentlynk - Creator Economy Reimagined',
    description: 'The first social platform that pays creators from day one. 55-75% revenue share, zero follower minimums, powered by Web3 and $HVNA tokens.',
    images: [
      {
        url: '/images/contentlynk-logo.png',
        width: 1200,
        height: 630,
        alt: 'Contentlynk - Fair Creator Compensation Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contentlynk - Creator Economy Reimagined',
    description: 'The first social platform that pays creators from day one. 55-75% revenue share, zero follower minimums.',
    images: ['/images/contentlynk-logo.png'],
    creator: '@havanaelephant',
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