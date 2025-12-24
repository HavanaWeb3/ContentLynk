/**
 * Client-side tracking utilities for posting consumption data to the API
 */

interface TrackConsumptionParams {
  postId: string;
  scrollDepth?: number;
  watchPercentage?: number;
  listenPercentage?: number;
  timeSpent?: number;
  completed?: boolean;
  sessionId?: string;
}

/**
 * Send consumption tracking data to the API
 */
export async function trackConsumption(params: TrackConsumptionParams): Promise<{
  success: boolean;
  sessionId?: string;
  error?: string;
}> {
  try {
    const response = await fetch('/api/track-consumption', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Failed to track consumption',
      };
    }

    const data = await response.json();
    return {
      success: true,
      sessionId: data.sessionId,
    };
  } catch (error) {
    console.error('Error tracking consumption:', error);
    return {
      success: false,
      error: 'Network error',
    };
  }
}

/**
 * Generate a persistent session ID for anonymous users
 * Stores in sessionStorage to maintain consistency across page views
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';

  const storageKey = 'contentlynk_session_id';
  let sessionId = sessionStorage.getItem(storageKey);

  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(storageKey, sessionId);
  }

  return sessionId;
}

/**
 * Debounce function for throttling tracking calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
