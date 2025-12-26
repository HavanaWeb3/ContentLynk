'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { wagmiConfig } from '@/lib/web3'
import '@rainbow-me/rainbowkit/styles.css'

interface ClientProvidersProps {
  children: React.ReactNode
}

// Create a client for React Query
const queryClient = new QueryClient()

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <SessionProvider>
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
              {children}
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#10b981',
                  },
                },
                error: {
                  duration: 5000,
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />
          </SessionProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}