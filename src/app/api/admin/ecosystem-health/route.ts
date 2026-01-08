import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Ecosystem monitoring logic (adapted from ecosystem-monitor.cjs)
const CONFIG = {
  sites: {
    havanaelephant: {
      name: 'Havana Elephant',
      url: 'https://havanaelephant.com',
      expectedMetrics: {
        hasElephantEmoji: true,
        hasCrossLink: 'contentlynk.com',
        hasSchema: true,
        twitterHandle: '@havanaelephant',
        themeColor: '#FF6B35',
      }
    },
    contentlynk: {
      name: 'Contentlynk',
      url: 'https://contentlynk.com',
      expectedMetrics: {
        hasElephantEmoji: true,
        hasCrossLink: 'havanaelephant.com',
        hasSchema: true,
        hasCanonical: true,
        twitterHandle: '@havanaelephant',
        themeColor: '#FF6B35',
      }
    }
  },
};

async function fetchURL(url: string, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ContentlynkEcosystemMonitor/1.0'
      }
    });

    clearTimeout(timeoutId);
    const body = await response.text();
    const responseTime = Date.now() - startTime;

    return {
      statusCode: response.status,
      body,
      responseTime
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    throw new Error(error.message || 'Request failed');
  }
}

function extractMetaTags(html: string) {
  const metaTags: any = {};

  // Extract title
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch) metaTags.title = titleMatch[1].trim();

  // Extract all meta tags
  const metaRegex = /<meta\s+([^>]+)>/gi;
  let match;

  while ((match = metaRegex.exec(html)) !== null) {
    const attributes = match[1];
    const propertyMatch = attributes.match(/(?:property|name)=["']([^"']+)["']/);
    const contentMatch = attributes.match(/content=["']([^"']+)["']/);

    if (propertyMatch && contentMatch) {
      metaTags[propertyMatch[1]] = contentMatch[1];
    }
  }

  // Extract canonical
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  if (canonicalMatch) metaTags.canonical = canonicalMatch[1];

  // Extract Schema.org
  const schemaMatch = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (schemaMatch) {
    try {
      metaTags.schema = JSON.parse(schemaMatch[1].trim());
    } catch (e) {
      metaTags.schema = null;
    }
  }

  return metaTags;
}

function checkMetaHealth(siteName: string, url: string, metaTags: any, expectedMetrics: any) {
  const results: any = {
    site: siteName,
    url,
    timestamp: new Date().toISOString(),
    checks: [],
    score: 0,
    totalChecks: 0,
  };

  function addCheck(name: string, passed: boolean, message: string) {
    results.checks.push({ name, passed, message });
    results.totalChecks++;
    if (passed) results.score++;
  }

  // Check for elephant emoji
  if (expectedMetrics.hasElephantEmoji) {
    const hasEmoji = metaTags.title?.includes('🐘') ||
                     metaTags['og:title']?.includes('🐘') ||
                     metaTags['twitter:title']?.includes('🐘');
    addCheck('Elephant Emoji', hasEmoji, hasEmoji ? 'Brand emoji present' : 'Missing 🐘 emoji');
  }

  // Check for cross-domain linking
  if (expectedMetrics.hasCrossLink) {
    const allDescriptions = (metaTags.description || '') +
                            (metaTags['og:description'] || '') +
                            (metaTags['twitter:description'] || '');
    const hasCrossLink = allDescriptions.includes(expectedMetrics.hasCrossLink);
    addCheck('Cross-Domain Link', hasCrossLink, hasCrossLink ? `References ${expectedMetrics.hasCrossLink}` : `Missing ${expectedMetrics.hasCrossLink}`);
  }

  // Check Schema.org
  if (expectedMetrics.hasSchema) {
    const hasSchema = metaTags.schema !== null && metaTags.schema !== undefined;
    addCheck('Schema.org', hasSchema, hasSchema ? `${metaTags.schema?.['@type']} schema` : 'Missing schema');
  }

  // Check canonical URL
  if (expectedMetrics.hasCanonical) {
    const hasCanonical = metaTags.canonical !== undefined;
    addCheck('Canonical URL', hasCanonical, hasCanonical ? `Present` : 'Missing');
  }

  // Check Twitter handle
  if (expectedMetrics.twitterHandle) {
    const correctHandle = metaTags['twitter:creator'] === expectedMetrics.twitterHandle &&
                         metaTags['twitter:site'] === expectedMetrics.twitterHandle;
    addCheck('Twitter Handle', correctHandle, correctHandle ? expectedMetrics.twitterHandle : 'Inconsistent');
  }

  // Check theme color
  if (expectedMetrics.themeColor) {
    const hasThemeColor = metaTags['theme-color'] === expectedMetrics.themeColor;
    addCheck('Theme Color', hasThemeColor, hasThemeColor ? expectedMetrics.themeColor : 'Incorrect');
  }

  // Check OG image
  const hasOGImage = metaTags['og:image'] !== undefined;
  addCheck('OG Image', hasOGImage, hasOGImage ? 'Present' : 'Missing');

  // Check OG image dimensions
  const correctDimensions = metaTags['og:image:width'] === '1200' && metaTags['og:image:height'] === '630';
  addCheck('OG Dimensions', correctDimensions, correctDimensions ? '1200x630' : 'Incorrect');

  // Calculate percentage
  results.scorePercentage = ((results.score / results.totalChecks) * 100).toFixed(1);

  return results;
}

async function monitorSite(siteKey: string, siteConfig: any) {
  const results: any = {
    site: siteConfig.name,
    url: siteConfig.url,
    status: 'checking',
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetchURL(siteConfig.url);

    results.status = 'online';
    results.statusCode = response.statusCode;
    results.responseTime = response.responseTime;

    const metaTags = extractMetaTags(response.body);
    results.metaHealth = checkMetaHealth(
      siteConfig.name,
      siteConfig.url,
      metaTags,
      siteConfig.expectedMetrics
    );

    results.performance = {
      responseTime: response.responseTime,
      rating: response.responseTime < 1000 ? 'excellent' :
              response.responseTime < 2000 ? 'good' :
              response.responseTime < 3000 ? 'fair' : 'poor'
    };

  } catch (error: any) {
    results.status = 'error';
    results.error = error.message;
  }

  return results;
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin (you'll need to verify this based on your auth setup)
    // @ts-ignore
    if (!session.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Monitor both sites
    const results: any = {};

    for (const [siteKey, siteConfig] of Object.entries(CONFIG.sites)) {
      results[siteKey] = await monitorSite(siteKey, siteConfig);
    }

    // Calculate overall health
    const scores = Object.values(results).map((r: any) => parseFloat(r.metaHealth?.scorePercentage || 0));
    const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      overallHealth: avgScore,
      sites: results
    });

  } catch (error: any) {
    console.error('Ecosystem health check error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
