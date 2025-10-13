/**
 * IP Address Tracking Service
 *
 * Prevents Sybil attacks by limiting signups per IP
 * - Max 5 accounts per IP in 24 hours
 */

import { prisma } from '@/lib/db';
import { headers } from 'next/headers';

const MAX_SIGNUPS_PER_IP = 5;
const IP_TRACKING_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get client IP address from request headers
 */
export function getClientIp(): string | null {
  const headersList = headers();

  // Try various headers (in order of preference)
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headersList.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = headersList.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback (less reliable)
  const remoteAddr = headersList.get('remote-addr');
  if (remoteAddr) {
    return remoteAddr;
  }

  return null;
}

/**
 * Track signup IP address
 *
 * @param userId - User ID
 * @param ipAddress - IP address
 */
export async function trackSignupIP(userId: string, ipAddress: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Store IP tracking record
    await prisma.signupIpTracking.create({
      data: {
        userId,
        ipAddress
      }
    });

    // Update user's signup IP
    await prisma.user.update({
      where: { id: userId },
      data: { signupIp: ipAddress }
    });

    console.log(`[IP Tracking] Tracked signup for user ${userId} from IP ${ipAddress}`);

    return { success: true };
  } catch (error) {
    console.error('[IP Tracking] Error tracking IP:', error);
    return { success: false, error: 'Failed to track IP address' };
  }
}

/**
 * Check IP rate limit
 *
 * @param ipAddress - IP address to check
 * @returns Rate limit check result
 */
export async function checkIPRateLimit(ipAddress: string): Promise<{
  allowed: boolean;
  currentCount: number;
  limit: number;
  retryAfter?: number;
  error?: string;
}> {
  try {
    const last24Hours = new Date(Date.now() - IP_TRACKING_WINDOW);

    // Clean up old tracking records
    await prisma.signupIpTracking.deleteMany({
      where: {
        ipAddress,
        createdAt: { lt: last24Hours }
      }
    });

    // Count recent signups from this IP
    const recentSignups = await prisma.signupIpTracking.count({
      where: {
        ipAddress,
        createdAt: { gte: last24Hours }
      }
    });

    if (recentSignups >= MAX_SIGNUPS_PER_IP) {
      // Find oldest signup to calculate retry time
      const oldestSignup = await prisma.signupIpTracking.findFirst({
        where: { ipAddress },
        orderBy: { createdAt: 'asc' }
      });

      const retryAfter = oldestSignup
        ? Math.ceil((oldestSignup.createdAt.getTime() + IP_TRACKING_WINDOW - Date.now()) / 1000)
        : 86400; // 24 hours

      return {
        allowed: false,
        currentCount: recentSignups,
        limit: MAX_SIGNUPS_PER_IP,
        retryAfter
      };
    }

    return {
      allowed: true,
      currentCount: recentSignups,
      limit: MAX_SIGNUPS_PER_IP
    };
  } catch (error) {
    console.error('[IP Tracking] Error checking rate limit:', error);
    return {
      allowed: true, // Fail open in case of error
      currentCount: 0,
      limit: MAX_SIGNUPS_PER_IP,
      error: 'Failed to check IP rate limit'
    };
  }
}

/**
 * Get signup statistics for an IP
 */
export async function getIPSignupStats(ipAddress: string): Promise<{
  total: number;
  last24Hours: number;
  userIds: string[];
}> {
  const last24Hours = new Date(Date.now() - IP_TRACKING_WINDOW);

  const [total, recent] = await Promise.all([
    prisma.signupIpTracking.count({
      where: { ipAddress }
    }),
    prisma.signupIpTracking.findMany({
      where: {
        ipAddress,
        createdAt: { gte: last24Hours }
      },
      select: { userId: true }
    })
  ]);

  return {
    total,
    last24Hours: recent.length,
    userIds: recent.map(r => r.userId)
  };
}

/**
 * Check if IP is suspicious (admin tool)
 */
export async function checkSuspiciousIP(ipAddress: string): Promise<{
  suspicious: boolean;
  reasons: string[];
  stats: {
    totalSignups: number;
    last24Hours: number;
    uniqueUsers: number;
  };
}> {
  const stats = await getIPSignupStats(ipAddress);
  const reasons: string[] = [];
  let suspicious = false;

  // Check for rate limit violation
  if (stats.last24Hours >= MAX_SIGNUPS_PER_IP) {
    suspicious = true;
    reasons.push(`Exceeded IP rate limit (${stats.last24Hours}/${MAX_SIGNUPS_PER_IP} in 24h)`);
  }

  // Check for unusually high total signups
  if (stats.total > 10) {
    suspicious = true;
    reasons.push(`Unusually high total signups (${stats.total})`);
  }

  return {
    suspicious,
    reasons,
    stats: {
      totalSignups: stats.total,
      last24Hours: stats.last24Hours,
      uniqueUsers: stats.userIds.length
    }
  };
}
