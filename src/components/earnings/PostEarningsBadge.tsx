'use client'

import { DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

interface PostEarningsBadgeProps {
  earnings: number
  className?: string
  showZero?: boolean
}

/**
 * Display earnings badge on a post
 * Shows how much the post has earned so far
 */
export function PostEarningsBadge({
  earnings,
  className = '',
  showZero = false
}: PostEarningsBadgeProps) {
  // Don't show badge if no earnings and showZero is false
  if (earnings === 0 && !showZero) {
    return null
  }

  const formattedEarnings = earnings.toFixed(2)

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center space-x-1 bg-green-50 text-green-700 border-green-200 ${className}`}
    >
      <DollarSign className="w-3 h-3" />
      <span className="font-semibold">{formattedEarnings}</span>
    </Badge>
  )
}
