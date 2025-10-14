/**
 * Detection Thresholds Configuration
 * Mode-aware thresholds for engagement velocity and gaming detection
 */

export interface VelocityThreshold {
  velocity: number // engagements per hour
  action: 'HOLD' | 'WARN' | 'REVIEW'
  extreme?: number // optional extreme threshold
  description: string
}

export interface DiversityThreshold {
  diversityThreshold: number // % from top 10 engagers
  penalty: number // Earnings multiplier (0.5 = 50% penalty)
  extremeThreshold?: number // Optional extreme concentration threshold
  action: 'APPLY_PENALTY' | 'WARN' | 'REVIEW'
  description: string
}

export interface ModeThresholds {
  engagementVelocity: VelocityThreshold
  creatorActivityVelocity: VelocityThreshold
  engagementDiversity: DiversityThreshold
  commentLength: {
    min: number
    suspicious: number
  }
  timeWindowMinutes: number
}

export const DETECTION_THRESHOLDS: Record<'BETA' | 'NATURAL', ModeThresholds> = {
  BETA: {
    // Strict thresholds for beta testing phase
    engagementVelocity: {
      velocity: 50,
      action: 'HOLD',
      description: 'Auto-flag and hold earnings immediately in BETA mode',
    },
    creatorActivityVelocity: {
      velocity: 50,
      action: 'HOLD',
      description: 'Creator giving too many engagements too quickly',
    },
    engagementDiversity: {
      diversityThreshold: 50, // If >50% from top 10, apply penalty
      penalty: 0.5, // 50% earnings reduction
      action: 'APPLY_PENALTY',
      description: 'Apply 50% penalty when most engagement comes from small group',
    },
    commentLength: {
      min: 3,
      suspicious: 10, // Comments under 10 chars are suspicious
    },
    timeWindowMinutes: 60,
  },

  NATURAL: {
    // More permissive thresholds allowing viral activity
    engagementVelocity: {
      velocity: 200,
      action: 'WARN',
      extreme: 500,
      description: 'Issue warning but allow earnings; extreme cases hold for review',
    },
    creatorActivityVelocity: {
      velocity: 200,
      action: 'WARN',
      extreme: 500,
      description: 'Warn on high activity, hold only on extreme',
    },
    engagementDiversity: {
      diversityThreshold: 90, // Much more lenient - trust natural communities
      penalty: 1.0, // No penalty by default
      extremeThreshold: 95, // Only flag extreme concentration (95%+)
      action: 'WARN',
      description: 'Trust natural communities; only warn on extreme concentration (95%+)',
    },
    commentLength: {
      min: 3,
      suspicious: 5, // More lenient in natural mode
    },
    timeWindowMinutes: 60,
  },
}

export const WARNING_STRIKE_SYSTEM = {
  STRIKE_1: {
    level: 'WARNING',
    message: 'Heads up! We noticed unusual activity on your account. Please review our community guidelines.',
    action: 'LOG_ONLY',
    expiryDays: 30,
  },
  STRIKE_2: {
    level: 'STRONG_WARNING',
    message: 'Second notice: Suspicious activity detected. Continued violations may result in probation.',
    action: 'EMAIL_NOTIFICATION',
    expiryDays: 30,
  },
  STRIKE_3: {
    level: 'PROBATION',
    message: 'Your account is now on probation. Earnings will be held for 7 days for review.',
    action: 'HOLD_EARNINGS',
    probationDays: 7,
    expiryDays: 30,
  },
  STRIKE_4: {
    level: 'SUSPEND',
    message: 'Your account has been suspended due to repeated violations of community guidelines.',
    action: 'SUSPEND_ACCOUNT',
    expiryDays: null, // Permanent until manual review
  },
} as const

export const EARNINGS_HOLD_DURATION = {
  BETA_MODE_FLAG: 24, // hours
  NATURAL_MODE_EXTREME: 48, // hours
  PROBATION: 7 * 24, // 7 days in hours
  MANUAL_REVIEW: null, // Indefinite until admin action
} as const

export const WARNING_EXPIRY_DAYS = 30

export type StrikeLevel = keyof typeof WARNING_STRIKE_SYSTEM
