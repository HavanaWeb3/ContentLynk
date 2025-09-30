import { MembershipTier } from '@/types/membership'

// Base earning rates per interaction (in $HVNA tokens)
export const BASE_EARNING_RATES = {
  VIEW: 0.001,
  LIKE: 0.01,
  COMMENT: 0.05,
  SHARE: 0.1,
} as const

// Revenue share multipliers by membership tier
export const REVENUE_SHARE_MULTIPLIERS = {
  STANDARD: 0.55,  // 55%
  SILVER: 0.60,    // 60%
  GOLD: 0.65,      // 65%
  PLATINUM: 0.70,  // 70%
  GENESIS: 0.75,   // 75%
} as const

// Engagement metrics interface
export interface EngagementMetrics {
  views: number
  likes: number
  comments: number
  shares: number
}

// Earnings breakdown interface
export interface EarningsBreakdown {
  baseEarnings: number
  tierMultiplier: number
  finalEarnings: number
  breakdown: {
    views: number
    likes: number
    comments: number
    shares: number
  }
}

/**
 * Calculate base earnings from engagement metrics
 */
export function calculateBaseEarnings(metrics: EngagementMetrics): number {
  const viewEarnings = metrics.views * BASE_EARNING_RATES.VIEW
  const likeEarnings = metrics.likes * BASE_EARNING_RATES.LIKE
  const commentEarnings = metrics.comments * BASE_EARNING_RATES.COMMENT
  const shareEarnings = metrics.shares * BASE_EARNING_RATES.SHARE

  return viewEarnings + likeEarnings + commentEarnings + shareEarnings
}

/**
 * Calculate earnings with membership tier multiplier
 */
export function calculateEarningsWithTier(
  metrics: EngagementMetrics,
  membershipTier: MembershipTier
): EarningsBreakdown {
  const baseEarnings = calculateBaseEarnings(metrics)
  const tierMultiplier = REVENUE_SHARE_MULTIPLIERS[membershipTier]
  const finalEarnings = baseEarnings * tierMultiplier

  const breakdown = {
    views: metrics.views * BASE_EARNING_RATES.VIEW * tierMultiplier,
    likes: metrics.likes * BASE_EARNING_RATES.LIKE * tierMultiplier,
    comments: metrics.comments * BASE_EARNING_RATES.COMMENT * tierMultiplier,
    shares: metrics.shares * BASE_EARNING_RATES.SHARE * tierMultiplier,
  }

  return {
    baseEarnings,
    tierMultiplier,
    finalEarnings,
    breakdown,
  }
}

/**
 * Calculate potential earnings for given engagement levels
 */
export function calculatePotentialEarnings(
  engagementLevel: 'low' | 'medium' | 'high' | 'viral',
  membershipTier: MembershipTier
): EarningsBreakdown {
  const engagementPresets = {
    low: { views: 100, likes: 5, comments: 1, shares: 0 },
    medium: { views: 1000, likes: 50, comments: 10, shares: 2 },
    high: { views: 10000, likes: 500, comments: 50, shares: 20 },
    viral: { views: 100000, likes: 5000, comments: 500, shares: 200 },
  }

  return calculateEarningsWithTier(engagementPresets[engagementLevel], membershipTier)
}

/**
 * Format earnings for display
 */
export function formatEarnings(amount: number, showCurrency = true): string {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })

  return showCurrency ? `${formatted} HVNA` : formatted
}

/**
 * Calculate next payout date (every Friday for demo)
 */
export function getNextPayoutDate(): Date {
  const now = new Date()
  const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7 // 5 = Friday
  const nextFriday = new Date(now)
  nextFriday.setDate(now.getDate() + daysUntilFriday)
  nextFriday.setHours(12, 0, 0, 0) // Noon on Friday
  return nextFriday
}

/**
 * Format time until next payout
 */
export function formatTimeUntilPayout(): string {
  const nextPayout = getNextPayoutDate()
  const now = new Date()
  const timeDiff = nextPayout.getTime() - now.getTime()

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) {
    return `${days}d ${hours}h`
  } else if (hours > 0) {
    return `${hours}h`
  } else {
    return 'Soon'
  }
}

/**
 * Calculate earnings growth between periods
 */
export function calculateEarningsGrowth(current: number, previous: number): {
  amount: number
  percentage: number
  isPositive: boolean
} {
  const amount = current - previous
  const percentage = previous > 0 ? (amount / previous) * 100 : 0
  const isPositive = amount >= 0

  return { amount, percentage, isPositive }
}

/**
 * Mock earnings data for development/demo
 */
export function generateMockEarnings(membershipTier: MembershipTier) {
  const multiplier = REVENUE_SHARE_MULTIPLIERS[membershipTier]

  return {
    total: 1250.75 * multiplier / 0.55, // Normalize to show tier impact
    thisMonth: 450.25 * multiplier / 0.55,
    thisWeek: 125.50 * multiplier / 0.55,
    today: 25.00 * multiplier / 0.55,
    pending: 89.33 * multiplier / 0.55,
    paid: 1161.42 * multiplier / 0.55,
  }
}

/**
 * Mock post earnings for development/demo
 */
export function generateMockPostEarnings(membershipTier: MembershipTier) {
  const multiplier = REVENUE_SHARE_MULTIPLIERS[membershipTier]

  return [
    {
      postId: '1',
      title: 'My thoughts on the creator economy...',
      metrics: { views: 2500, likes: 150, comments: 25, shares: 8 },
      earnings: calculateEarningsWithTier(
        { views: 2500, likes: 150, comments: 25, shares: 8 },
        membershipTier
      ).finalEarnings,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    {
      postId: '2',
      title: 'Building in Web3 is amazing!',
      metrics: { views: 1200, likes: 80, comments: 12, shares: 3 },
      earnings: calculateEarningsWithTier(
        { views: 1200, likes: 80, comments: 12, shares: 3 },
        membershipTier
      ).finalEarnings,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    },
    {
      postId: '3',
      title: 'Why I love the Havana Elephant community',
      metrics: { views: 890, likes: 45, comments: 8, shares: 2 },
      earnings: calculateEarningsWithTier(
        { views: 890, likes: 45, comments: 8, shares: 2 },
        membershipTier
      ).finalEarnings,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    },
  ]
}