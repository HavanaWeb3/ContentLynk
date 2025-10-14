/**
 * Platform Mode Configuration
 * Switch between BETA (strict caps) and NATURAL (no caps) modes
 */

export type PlatformMode = 'BETA' | 'NATURAL'

export interface ModeConfig {
  caps: {
    perPost: number | null
    daily: number | null
  }
  gracePeriodDays: number
  action: 'BLOCK' | 'CAP' | 'WARN'
}

// Mode configurations
const MODE_CONFIGS: Record<PlatformMode, ModeConfig> = {
  BETA: {
    caps: {
      perPost: 100, // $100 per post cap
      daily: 500,   // $500 daily cap
    },
    gracePeriodDays: 3, // 3-day grace period for new accounts
    action: 'BLOCK', // Block earnings that exceed caps
  },
  NATURAL: {
    caps: {
      perPost: null, // No per-post cap
      daily: null,   // No daily cap
    },
    gracePeriodDays: 0, // No grace period needed
    action: 'WARN', // Only warn, don't block
  },
}

// For test mocking
export const PLATFORM_MODE = {
  CURRENT: (process.env.PLATFORM_MODE as PlatformMode) || 'BETA',
}

export async function getCurrentPlatformMode(): Promise<PlatformMode> {
  // Default to BETA mode for initial launch
  // Switch to NATURAL after platform is stable
  const mode = (process.env.PLATFORM_MODE as PlatformMode) || PLATFORM_MODE.CURRENT || 'BETA'
  return mode
}

export function getCurrentModeConfig(): ModeConfig {
  const mode = PLATFORM_MODE.CURRENT || 'BETA'
  return MODE_CONFIGS[mode]
}

// Synchronous version for use in non-async contexts
export function isBetaModeSync(): boolean {
  const mode = PLATFORM_MODE.CURRENT || 'BETA'
  return mode === 'BETA'
}

// Async version (for compatibility)
export async function isBetaMode(): Promise<boolean> {
  const mode = await getCurrentPlatformMode()
  return mode === 'BETA'
}

export async function isNaturalMode(): Promise<boolean> {
  const mode = await getCurrentPlatformMode()
  return mode === 'NATURAL'
}

export function getModeMessage(exceeded: boolean, capType: 'perPost' | 'daily'): string {
  const mode = PLATFORM_MODE.CURRENT || 'BETA'

  if (mode === 'BETA') {
    if (capType === 'perPost') {
      return exceeded
        ? 'Per-post earnings cap exceeded. Earnings blocked in BETA mode.'
        : 'Within per-post earnings cap.'
    } else {
      return exceeded
        ? 'Daily earnings cap exceeded. No more earnings today in BETA mode.'
        : 'Within daily earnings cap.'
    }
  } else {
    return exceeded
      ? `High ${capType === 'perPost' ? 'per-post' : 'daily'} earnings detected. Monitoring only (NATURAL mode).`
      : 'Earnings processed successfully.'
  }
}
