'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  formatEarnings,
  formatTimeUntilPayout,
  getNextPayoutDate
} from '@/lib/earnings'
import { TrendingUp, Clock, Wallet, DollarSign, AlertCircle } from 'lucide-react'
import { MembershipTier } from '@/types/membership'

interface EarningsDisplayProps {
  membershipTier?: MembershipTier
  className?: string
}

interface EarningsSummary {
  total: number
  today: number
  pending: number
  dailyLimit: number | null
  dailyRemaining: number | null
  gracePeriodActive: boolean
  mode: 'BETA' | 'NATURAL'
}

export function EarningsDisplay({ membershipTier = MembershipTier.STANDARD, className }: EarningsDisplayProps) {
  const { data: session } = useSession()
  const [timeUntilPayout, setTimeUntilPayout] = useState('')
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real earnings data
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await fetch('/api/earnings/summary')
        if (!response.ok) {
          throw new Error('Failed to fetch earnings')
        }
        const data = await response.json()
        setEarnings(data)
      } catch (err) {
        console.error('Error fetching earnings:', err)
        setError('Failed to load earnings data')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchEarnings()
    }
  }, [session])

  // Update countdown every minute
  useEffect(() => {
    const updateCountdown = () => {
      setTimeUntilPayout(formatTimeUntilPayout())
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000)

    return () => clearInterval(interval)
  }, [])

  const nextPayoutDate = getNextPayoutDate()

  const revenueSharePercentage = {
    STANDARD: 55,
    SILVER: 60,
    GOLD: 65,
    PLATINUM: 70,
    GENESIS: 75,
  }[membershipTier]

  // Loading state
  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-32 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error || !earnings) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
              <p className="text-gray-600">{error || 'No earnings data available'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* BETA Mode Warning */}
      {earnings.mode === 'BETA' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="py-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-orange-900">BETA Mode Active</h4>
                <p className="text-sm text-orange-800 mt-1">
                  Platform is in testing mode. Earnings are capped at $100 per post and $500 per day.
                  {earnings.gracePeriodActive && (
                    <span className="block mt-1 font-medium">
                      ✨ Grace period active - daily cap waived for your first 3 days!
                    </span>
                  )}
                </p>
                {earnings.dailyLimit && earnings.dailyRemaining !== null && (
                  <p className="text-sm text-orange-700 mt-2">
                    Daily earnings: ${earnings.today.toFixed(2)} / ${earnings.dailyLimit.toFixed(2)}
                    {' '}(${earnings.dailyRemaining.toFixed(2)} remaining)
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Earnings */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              Total Earnings
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {formatEarnings(earnings.total)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">All time earnings</p>
            <Badge className="mt-2 bg-green-100 text-green-700">
              {revenueSharePercentage}% tier rate
            </Badge>
          </CardContent>
        </Card>

        {/* Pending Payout */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Payout</CardDescription>
            <CardTitle className="text-2xl text-orange-600">
              {formatEarnings(earnings.pending)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Awaiting next payout</p>
            <Badge variant="outline" className="mt-2 font-mono">
              {timeUntilPayout}
            </Badge>
          </CardContent>
        </Card>

        {/* Today */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today's Earnings</CardDescription>
            <CardTitle className="text-2xl">
              {formatEarnings(earnings.today)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Keep creating!</p>
            {earnings.mode === 'BETA' && earnings.dailyRemaining !== null && (
              <p className="text-xs text-orange-600 mt-1">
                ${earnings.dailyRemaining.toFixed(2)} remaining today
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payout Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Next Payout</span>
          </CardTitle>
          <CardDescription>Scheduled payout information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Pending Amount</div>
              <div className="font-semibold text-lg text-orange-600">
                {formatEarnings(earnings.pending)}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Next Payout Date</div>
              <div className="font-medium">
                {nextPayoutDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Time Remaining</div>
              <Badge variant="outline" className="font-mono">
                {timeUntilPayout}
              </Badge>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500">
              Payouts are processed every Friday at 12:00 PM UTC directly to your connected wallet.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Earning Formula */}
      <Card>
        <CardHeader>
          <CardTitle>How You Earn</CardTitle>
          <CardDescription>Quality score calculation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Likes</div>
                <div className="font-bold text-2xl text-gray-900">×1</div>
                <div className="text-xs text-gray-500">quality points</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Comments</div>
                <div className="font-bold text-2xl text-blue-600">×5</div>
                <div className="text-xs text-gray-500">quality points</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Shares</div>
                <div className="font-bold text-2xl text-purple-600">×20</div>
                <div className="text-xs text-gray-500">quality points</div>
              </div>
            </div>

            <div className="p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-900 font-medium mb-2">
                Formula: Quality Score × $0.10 × Tier Multiplier × NFT Multiplier
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-indigo-800">
                <div>• Your tier: <strong>{membershipTier}</strong> ({revenueSharePercentage}% share)</div>
                <div>• NFT multiplier: <strong>1.5×</strong> if verified</div>
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                💡 <strong>Example:</strong> A post with 100 likes, 10 comments, 5 shares = (100 + 50 + 100) quality points = 250 points × $0.10 = <strong>$25 base earnings</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}