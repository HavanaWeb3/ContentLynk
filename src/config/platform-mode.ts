/**
 * Platform Mode Configuration
 * Manages BETA vs NATURAL mode switching
 */

export type PlatformMode = 'BETA' | 'NATURAL'

/**
 * Get current platform mode
 * For now, returns hardcoded mode. In future, this could:
 * - Read from database (platform_config table)
 * - Read from environment variable
 * - Use feature flags
 */
export async function getCurrentPlatformMode(): Promise<PlatformMode> {
  // Default to BETA mode for initial launch
  // Switch to NATURAL after platform is stable
  const mode = (process.env.PLATFORM_MODE as PlatformMode) || 'BETA'
  return mode
}

/**
 * Check if platform is in BETA mode
 */
export async function isBetaMode(): Promise<boolean> {
  const mode = await getCurrentPlatformMode()
  return mode === 'BETA'
}

/**
 * Check if platform is in NATURAL mode
 */
export async function isNaturalMode(): Promise<boolean> {
  const mode = await getCurrentPlatformMode()
  return mode === 'NATURAL'
}
