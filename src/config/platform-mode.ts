/**
 * Platform Mode Configuration
 *
 * Controls how the platform handles earning caps and protection
 *
 * BETA MODE: Testing phase with strict caps and blocking
 * NATURAL MODE: Production phase with no caps, monitoring only
 */

export type PlatformMode = 'BETA' | 'NATURAL';

export interface ModeConfig {
  caps: {
    perPost: number | null;  // Max earnings per post (null = unlimited)
    daily: number | null;     // Max earnings per day (null = unlimited)
    enforced: boolean;        // Whether caps are enforced
  };
  action: 'BLOCK' | 'WARN';   // Action when threshold exceeded
  gracePeriodDays: number;    // Days before daily cap is enforced (BETA only)
}

export interface PlatformModeConfig {
  CURRENT: PlatformMode;
  BETA: ModeConfig;
  NATURAL: ModeConfig;
}

/**
 * Get current platform mode from environment
 * Defaults to BETA for safety during testing phase
 */
function getCurrentMode(): PlatformMode {
  const mode = process.env.PLATFORM_MODE?.toUpperCase() as PlatformMode;

  if (mode && (mode === 'BETA' || mode === 'NATURAL')) {
    return mode;
  }

  // Default to BETA for safety
  return 'BETA';
}

/**
 * Platform Mode Configuration Object
 *
 * Read from environment variable: PLATFORM_MODE
 * Valid values: 'BETA' | 'NATURAL'
 * Default: 'BETA'
 */
export const PLATFORM_MODE: PlatformModeConfig = {
  CURRENT: getCurrentMode(),

  /**
   * BETA MODE (Testing - 12 weeks)
   *
   * Purpose: Test detection systems, identify gaming patterns
   * Duration: ~12 weeks from launch
   *
   * Characteristics:
   * - Per-post cap: $100 maximum
   * - Daily cap: $500 maximum (with 3-day grace period)
   * - Action: BLOCK if exceeded
   * - Strict enforcement
   */
  BETA: {
    caps: {
      perPost: 100,      // $100 max per post
      daily: 500,        // $500 max per day
      enforced: true,    // Caps are hard limits
    },
    action: 'BLOCK',     // Block transactions that exceed caps
    gracePeriodDays: 3,  // 3 days before daily cap kicks in
  },

  /**
   * NATURAL MODE (Post-launch)
   *
   * Purpose: Sustainable long-term operation with unlimited earning potential
   * Duration: Indefinite (post-beta)
   *
   * Characteristics:
   * - Per-post cap: None (unlimited!)
   * - Daily cap: None (unlimited!)
   * - Action: WARN only (monitoring + trust system)
   * - Warning-based protection
   */
  NATURAL: {
    caps: {
      perPost: null,     // No limit
      daily: null,       // No limit
      enforced: false,   // Caps not enforced
    },
    action: 'WARN',      // Warn about suspicious patterns
    gracePeriodDays: 0,  // No grace period needed
  },
};

/**
 * Get the current mode configuration
 */
export function getCurrentModeConfig(): ModeConfig {
  return PLATFORM_MODE[PLATFORM_MODE.CURRENT];
}

/**
 * Check if platform is in BETA mode
 */
export function isBetaMode(): boolean {
  return PLATFORM_MODE.CURRENT === 'BETA';
}

/**
 * Check if platform is in NATURAL mode
 */
export function isNaturalMode(): boolean {
  return PLATFORM_MODE.CURRENT === 'NATURAL';
}

/**
 * Get mode-specific messaging for cap enforcement
 */
export function getModeMessage(exceeded: boolean, type: 'perPost' | 'daily'): string {
  const config = getCurrentModeConfig();

  if (!exceeded) {
    return 'Earnings processed successfully';
  }

  if (config.action === 'BLOCK') {
    const capType = type === 'perPost' ? 'per-post' : 'daily';
    const capAmount = type === 'perPost' ? config.caps.perPost : config.caps.daily;
    return `Earnings exceed ${capType} cap of $${capAmount}. Transaction blocked during BETA phase.`;
  } else {
    return 'Earnings flagged for review. Trust score may be affected.';
  }
}

/**
 * Log current mode on module initialization
 */
if (typeof window === 'undefined') {
  // Server-side only
  console.log(`[Platform Mode] Running in ${PLATFORM_MODE.CURRENT} mode`);
  const config = getCurrentModeConfig();
  console.log(`[Platform Mode] Per-post cap: ${config.caps.perPost ? '$' + config.caps.perPost : 'UNLIMITED'}`);
  console.log(`[Platform Mode] Daily cap: ${config.caps.daily ? '$' + config.caps.daily : 'UNLIMITED'}`);
  console.log(`[Platform Mode] Action: ${config.action}`);
}
