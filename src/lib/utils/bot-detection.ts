/**
 * Bot Detection Utility
 * Analyzes user accounts to identify likely bots, suspicious accounts, and legitimate users
 */

export interface BotAnalysisResult {
  isLikelyBot: boolean;
  isSuspicious: boolean;
  indicators: string[];
  score: number; // 0-100, higher = more likely bot
}

export interface UserForBotAnalysis {
  username: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  createdAt: Date | string;
  _count?: {
    posts: number;
    followers: number;
    following: number;
  };
}

/**
 * Check if username looks like a random string (typical of bots)
 */
export function hasRandomStringUsername(username: string): boolean {
  if (!username) return false;

  // Check for patterns typical of random usernames
  const patterns = [
    // Long string of random alphanumeric characters
    /^[a-zA-Z]{8,}[0-9]{2,}$/,
    // Mixed case with numbers interspersed
    /^[A-Z][a-z]+[A-Z][a-z]+[A-Z][a-z]+/,
    // All caps with numbers
    /^[A-Z]{5,}[0-9]+$/,
    // Pattern like "adjNoun123"
    /^[a-z]{3,}[A-Z][a-z]{3,}[0-9]+$/,
  ];

  // High entropy check - random strings have more character variety
  const uniqueChars = new Set(username.toLowerCase()).size;
  const entropyRatio = uniqueChars / username.length;

  // Check for consonant clusters (unlikely in real names)
  const consonantCluster = /[bcdfghjklmnpqrstvwxyz]{5,}/i;

  // Random-looking patterns
  if (patterns.some(p => p.test(username))) return true;

  // High entropy with length > 12 suggests randomness
  if (username.length > 12 && entropyRatio > 0.6) return true;

  // Long consonant clusters
  if (consonantCluster.test(username)) return true;

  // Mix of upper and lowercase in unusual patterns
  const upperCount = (username.match(/[A-Z]/g) || []).length;
  const lowerCount = (username.match(/[a-z]/g) || []).length;
  if (upperCount > 3 && lowerCount > 3 && username.length > 15) return true;

  return false;
}

/**
 * Check if email is from a corporate/enterprise domain (less likely to be bot)
 */
export function hasCorporateEmail(email: string | null): boolean {
  if (!email) return false;

  const corporateDomains = [
    'company.com', 'corp.com', 'enterprise.com',
    // Common legitimate free email providers are NOT corporate
  ];

  const freeEmailDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
    'aol.com', 'icloud.com', 'protonmail.com', 'mail.com',
    'yandex.com', 'zoho.com'
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;

  // If not a free email provider, might be corporate
  return !freeEmailDomains.includes(domain);
}

/**
 * Check if email looks temporary/disposable
 */
export function hasDisposableEmail(email: string | null): boolean {
  if (!email) return false;

  const disposableDomains = [
    'tempmail.com', 'throwaway.email', 'guerrillamail.com',
    'mailinator.com', '10minutemail.com', 'temp-mail.org',
    'fakeinbox.com', 'sharklasers.com', 'guerrillamail.info',
    'maildrop.cc', 'getairmail.com', 'dispostable.com'
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  return disposableDomains.includes(domain || '');
}

/**
 * Analyze a user for bot indicators
 */
export function analyzeUserForBot(user: UserForBotAnalysis): BotAnalysisResult {
  const indicators: string[] = [];
  let score = 0;

  // Check username
  if (hasRandomStringUsername(user.username)) {
    indicators.push('Random-looking username');
    score += 25;
  }

  // Check email verification
  if (!user.emailVerified) {
    indicators.push('Email not verified');
    score += 20;
  }

  // Check for disposable email
  if (hasDisposableEmail(user.email)) {
    indicators.push('Disposable email address');
    score += 30;
  }

  // Check activity
  const posts = user._count?.posts || 0;
  const followers = user._count?.followers || 0;
  const following = user._count?.following || 0;

  if (posts === 0 && followers === 0 && following === 0) {
    indicators.push('Zero activity');
    score += 15;
  }

  // Check account age vs activity
  const createdAt = new Date(user.createdAt);
  const accountAgeDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

  if (accountAgeDays > 7 && posts === 0 && followers === 0) {
    indicators.push('Old account with no activity');
    score += 10;
  }

  // Corporate email is a positive signal
  if (hasCorporateEmail(user.email)) {
    score -= 15; // Reduce bot score
  }

  // Verified email is a positive signal
  if (user.emailVerified) {
    score -= 20; // Reduce bot score
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  return {
    isLikelyBot: score >= 50,
    isSuspicious: score >= 30 && score < 50,
    indicators,
    score
  };
}

/**
 * Quick check if user is likely a bot
 */
export function isLikelyBot(user: UserForBotAnalysis): boolean {
  return analyzeUserForBot(user).isLikelyBot;
}

/**
 * Filter type for user queries
 */
export type UserFilterType = 'all' | 'verified' | 'unverified' | 'likely-bots' | 'suspicious' | 'admin';

/**
 * Get filter counts for a list of users
 */
export function getFilterCounts(users: UserForBotAnalysis[]): Record<UserFilterType, number> {
  const counts: Record<UserFilterType, number> = {
    all: users.length,
    verified: 0,
    unverified: 0,
    'likely-bots': 0,
    suspicious: 0,
    admin: 0
  };

  for (const user of users) {
    if (user.emailVerified) {
      counts.verified++;
    } else {
      counts.unverified++;
    }

    const analysis = analyzeUserForBot(user);
    if (analysis.isLikelyBot) {
      counts['likely-bots']++;
    } else if (analysis.isSuspicious) {
      counts.suspicious++;
    }
  }

  return counts;
}
// Build trigger Fri Jan 16 22:20:06 CET 2026
