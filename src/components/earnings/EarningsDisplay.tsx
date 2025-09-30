'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  formatEarnings,
  formatTimeUntilPayout,
  getNextPayoutDate,
  generateMockEarnings,
  calculateEarningsGrowth
} from '@/lib/earnings'
import { TrendingUp, TrendingDown, Clock, Wallet, DollarSign } from 'lucide-react'
import { MembershipTier } from '@/types/membership'

interface EarningsDisplayProps {
  membershipTier?: MembershipTier
  className?: string
}

export function EarningsDisplay({ membershipTier = MembershipTier.STANDARD, className }: EarningsDisplayProps) {
  const { data: session } = useSession()
  const [timeUntilPayout, setTimeUntilPayout] = useState('')

  // Update countdown every minute
  useEffect(() => {
    const updateCountdown = () => {
      setTimeUntilPayout(formatTimeUntilPayout())
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000)

    return () => clearInterval(interval)
  }, [])

  // Generate mock earnings based on membership tier
  const earnings = generateMockEarnings(membershipTier)
  const nextPayoutDate = getNextPayoutDate()

  // Calculate growth metrics
  const weeklyGrowth = calculateEarningsGrowth(earnings.thisWeek, 95.20)
  const monthlyGrowth = calculateEarningsGrowth(earnings.thisMonth, 385.60)

  const revenueSharePercentage = {
    STANDARD: 55,
    SILVER: 60,
    GOLD: 65,
    PLATINUM: 70,
    GENESIS: 75,
  }[membershipTier]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* This Month */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>This Month</CardDescription>
            <CardTitle className="text-2xl">
              {formatEarnings(earnings.thisMonth)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-1">
              {monthlyGrowth.isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm ${monthlyGrowth.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {monthlyGrowth.isPositive ? '+' : ''}{monthlyGrowth.percentage.toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500">from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* This Week */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>This Week</CardDescription>
            <CardTitle className="text-2xl">
              {formatEarnings(earnings.thisWeek)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-1">
              {weeklyGrowth.isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm ${weeklyGrowth.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {weeklyGrowth.isPositive ? '+' : ''}{weeklyGrowth.percentage.toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500">from last week</span>
            </div>
          </CardContent>
        </Card>

        {/* Today */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today</CardDescription>
            <CardTitle className="text-2xl">
              {formatEarnings(earnings.today)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Keep creating!</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Payout */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Next Payout</span>
            </CardTitle>
            <CardDescription>Scheduled payout information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Amount:</span>
              <span className="font-semibold text-lg text-orange-600">
                {formatEarnings(earnings.pending)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Next Payout:</span>
              <span className="font-medium">
                {nextPayoutDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Time Remaining:</span>
              <Badge variant="outline" className="font-mono">
                {timeUntilPayout}
              </Badge>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500">
                Payouts are processed every Friday at 12:00 PM UTC directly to your connected wallet.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>Wallet Status</span>
            </CardTitle>
            <CardDescription>Your $HVNA token information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Paid:</span>
              <span className="font-semibold text-lg text-green-600">
                {formatEarnings(earnings.paid)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Revenue Share:</span>
              <Badge className="bg-indigo-100 text-indigo-800">
                {revenueSharePercentage}%
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Membership:</span>
              <Badge className={
                membershipTier === MembershipTier.GENESIS
                  ? 'bg-indigo-100 text-indigo-800'
                  : membershipTier === MembershipTier.PLATINUM
                  ? 'bg-purple-100 text-purple-800'
                  : membershipTier === MembershipTier.GOLD
                  ? 'bg-yellow-100 text-yellow-800'
                  : membershipTier === MembershipTier.SILVER
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-blue-100 text-blue-800'
              }>
                {membershipTier}
              </Badge>
            </div>

            <Button variant="outline" size="sm" className="w-full">
              View Transaction History
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Earning Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>How You Earn</CardTitle>
          <CardDescription>Your revenue rates based on engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Views</div>
              <div className="font-semibold">
                {formatEarnings(0.001 * (revenueSharePercentage / 100))}
              </div>
              <div className="text-xs text-gray-500">per view</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Likes</div>
              <div className="font-semibold">
                {formatEarnings(0.01 * (revenueSharePercentage / 100))}
              </div>
              <div className="text-xs text-gray-500">per like</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Comments</div>
              <div className="font-semibold">
                {formatEarnings(0.05 * (revenueSharePercentage / 100))}
              </div>
              <div className="text-xs text-gray-500">per comment</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Shares</div>
              <div className="font-semibold">
                {formatEarnings(0.1 * (revenueSharePercentage / 100))}
              </div>
              <div className="text-xs text-gray-500">per share</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
            <p className="text-sm text-indigo-800">
              💡 <strong>Your {membershipTier} membership</strong> gives you {revenueSharePercentage}% of base earnings.
              {membershipTier !== MembershipTier.GENESIS && ' Connect your wallet and verify NFT holdings to unlock higher rates!'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}