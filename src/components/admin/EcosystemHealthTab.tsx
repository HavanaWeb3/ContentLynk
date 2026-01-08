'use client';

import { useEffect, useState } from 'react';

interface SiteHealth {
  site: string;
  url: string;
  status: string;
  statusCode?: number;
  responseTime?: number;
  error?: string;
  metaHealth?: {
    site: string;
    url: string;
    timestamp: string;
    checks: Array<{
      name: string;
      passed: boolean;
      message: string;
    }>;
    score: number;
    totalChecks: number;
    scorePercentage: string;
  };
  performance?: {
    responseTime: number;
    rating: 'excellent' | 'good' | 'fair' | 'poor';
  };
}

interface EcosystemData {
  success: boolean;
  timestamp: string;
  overallHealth: string;
  sites: {
    havanaelephant: SiteHealth;
    contentlynk: SiteHealth;
  };
}

export default function EcosystemHealthTab() {
  const [data, setData] = useState<EcosystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchEcosystemHealth();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchEcosystemHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchEcosystemHealth = async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/ecosystem-health');

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('Error fetching ecosystem health:', err);
      setError(err.message || 'Failed to fetch ecosystem health');
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 75) return 'text-yellow-600 dark:text-yellow-400';
    if (percentage >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getHealthBg = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (percentage >= 75) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    if (percentage >= 60) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  const getPerformanceColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'fair': return 'text-yellow-600 dark:text-yellow-400';
      case 'poor': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading ecosystem health...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <span className="text-3xl">⚠️</span>
          <div>
            <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">
              Error Loading Ecosystem Health
            </h3>
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                fetchEcosystemHealth();
              }}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const overallScore = parseFloat(data.overallHealth);

  return (
    <div className="space-y-6">
      {/* Overall Health Header */}
      <div className={`rounded-lg p-8 border-2 ${getHealthBg(overallScore)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              🐘 Ecosystem Health Monitor
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Real-time monitoring of havanaelephant.com and contentlynk.com
            </p>
          </div>
          <div className="text-center">
            <div className={`text-5xl font-bold ${getHealthColor(overallScore)}`}>
              {overallScore.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Overall Health</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Last checked: {lastRefresh.toLocaleTimeString()}
          </p>
          <button
            onClick={fetchEcosystemHealth}
            className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
          >
            🔄 Refresh Now
          </button>
        </div>
      </div>

      {/* Site Health Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Havana Elephant */}
        {data.sites.havanaelephant && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {data.sites.havanaelephant.site}
                  </h3>
                  <a
                    href={data.sites.havanaelephant.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {data.sites.havanaelephant.url} →
                  </a>
                </div>
                {data.sites.havanaelephant.status === 'online' ? (
                  <span className="text-3xl">🟢</span>
                ) : (
                  <span className="text-3xl">🔴</span>
                )}
              </div>

              {data.sites.havanaelephant.metaHealth && (
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Meta Tag Health
                    </span>
                    <span className={`text-2xl font-bold ${getHealthColor(parseFloat(data.sites.havanaelephant.metaHealth.scorePercentage))}`}>
                      {data.sites.havanaelephant.metaHealth.scorePercentage}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    {data.sites.havanaelephant.metaHealth.score} / {data.sites.havanaelephant.metaHealth.totalChecks} checks passed
                  </div>
                </div>
              )}

              {data.sites.havanaelephant.performance && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Response Time
                    </span>
                    <span className={`font-semibold ${getPerformanceColor(data.sites.havanaelephant.performance.rating)}`}>
                      {data.sites.havanaelephant.performance.responseTime}ms
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-500 mt-1 capitalize">
                    {data.sites.havanaelephant.performance.rating}
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Checks */}
            {data.sites.havanaelephant.metaHealth && (
              <div className="p-6">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                  Meta Tag Checks
                </h4>
                <div className="space-y-2">
                  {data.sites.havanaelephant.metaHealth.checks.map((check, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className={check.passed ? 'text-green-500' : 'text-red-500'}>
                        {check.passed ? '✓' : '✗'}
                      </span>
                      <div className="flex-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {check.name}:
                        </span>
                        <span className={`ml-2 ${check.passed ? 'text-gray-600 dark:text-gray-400' : 'text-red-600 dark:text-red-400'}`}>
                          {check.message}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contentlynk */}
        {data.sites.contentlynk && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {data.sites.contentlynk.site}
                  </h3>
                  <a
                    href={data.sites.contentlynk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {data.sites.contentlynk.url} →
                  </a>
                </div>
                {data.sites.contentlynk.status === 'online' ? (
                  <span className="text-3xl">🟢</span>
                ) : (
                  <span className="text-3xl">🔴</span>
                )}
              </div>

              {data.sites.contentlynk.metaHealth && (
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Meta Tag Health
                    </span>
                    <span className={`text-2xl font-bold ${getHealthColor(parseFloat(data.sites.contentlynk.metaHealth.scorePercentage))}`}>
                      {data.sites.contentlynk.metaHealth.scorePercentage}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    {data.sites.contentlynk.metaHealth.score} / {data.sites.contentlynk.metaHealth.totalChecks} checks passed
                  </div>
                </div>
              )}

              {data.sites.contentlynk.performance && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Response Time
                    </span>
                    <span className={`font-semibold ${getPerformanceColor(data.sites.contentlynk.performance.rating)}`}>
                      {data.sites.contentlynk.performance.responseTime}ms
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-500 mt-1 capitalize">
                    {data.sites.contentlynk.performance.rating}
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Checks */}
            {data.sites.contentlynk.metaHealth && (
              <div className="p-6">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                  Meta Tag Checks
                </h4>
                <div className="space-y-2">
                  {data.sites.contentlynk.metaHealth.checks.map((check, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className={check.passed ? 'text-green-500' : 'text-red-500'}>
                        {check.passed ? '✓' : '✗'}
                      </span>
                      <div className="flex-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {check.name}:
                        </span>
                        <span className={`ml-2 ${check.passed ? 'text-gray-600 dark:text-gray-400' : 'text-red-600 dark:text-red-400'}`}>
                          {check.message}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
              About Ecosystem Health Monitoring
            </h3>
            <p className="text-blue-800 dark:text-blue-200 mb-3">
              This dashboard monitors meta tags, performance, and cross-domain linking for both sites in the Havana Elephant ecosystem.
            </p>
            <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <p>• <strong>90-100%:</strong> Excellent - All optimizations in place</p>
              <p>• <strong>75-89%:</strong> Good - Minor tweaks needed</p>
              <p>• <strong>60-74%:</strong> Fair - Review warnings</p>
              <p>• <strong>&lt;60%:</strong> Poor - Immediate attention required</p>
            </div>
            <p className="mt-3 text-sm text-blue-600 dark:text-blue-400">
              <strong>Note:</strong> Low scores after deployment are normal due to CDN caching. Scores typically improve to 95%+ within 24-48 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
