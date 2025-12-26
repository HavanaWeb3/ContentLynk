'use client';

import { useEffect, useState } from 'react';

export default function OverviewTab() {
  const [stats, setStats] = useState({
    flaggedPosts: 0,
    betaApplications: 0,
    totalUsers: 0,
    recentActivity: [],
    earnings: {
      total: 0,
      today: 0,
      pending: 0,
      mode: 'BETA' as 'BETA' | 'NATURAL'
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewStats();
  }, []);

  const fetchOverviewStats = async () => {
    try {
      // Fetch stats from multiple endpoints
      const [flaggedRes, betaRes, earningsRes, usersRes] = await Promise.all([
        fetch('/api/admin/flagged'),
        fetch('/api/beta-applications'),
        fetch('/api/admin/earnings-stats'),
        fetch('/api/admin/users')
      ]);

      const flaggedData = await flaggedRes.json();
      const betaData = await betaRes.json();
      const earningsData = await earningsRes.json();
      const usersData = await usersRes.json();

      setStats({
        flaggedPosts: flaggedData.flaggedPosts?.length || 0,
        betaApplications: betaData.applications?.filter((a: any) => a.status === 'PENDING').length || 0,
        totalUsers: usersData.stats?.total || 0,
        recentActivity: [],
        earnings: {
          total: earningsData.total || 0,
          today: earningsData.today || 0,
          pending: earningsData.pending || 0,
          mode: earningsData.mode || 'BETA'
        }
      });
    } catch (error) {
      console.error('Error fetching overview stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to Your Admin Dashboard</h2>
        <p className="text-indigo-100">
          Manage your platform, review content, and monitor activity all in one place.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Flagged Posts
              </p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                {stats.flaggedPosts}
              </p>
            </div>
            <div className="text-4xl">🚨</div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            Require review
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Beta Applications
              </p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                {stats.betaApplications}
              </p>
            </div>
            <div className="text-4xl">📝</div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            Pending approval
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Total Earnings
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                ${stats.earnings.total.toFixed(2)}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            Platform-wide
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Total Users
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {stats.totalUsers || '—'}
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            Registered creators
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                System Status
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                ✓
              </p>
            </div>
            <div className="text-4xl">🟢</div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            All systems operational
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/admin?tab=flagged'}
            className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-600 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
          >
            <span className="text-2xl">🚨</span>
            <div className="text-left">
              <p className="font-semibold text-gray-900 dark:text-white">Review Flagged Posts</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stats.flaggedPosts} pending</p>
            </div>
          </button>

          <button
            onClick={() => window.location.href = '/admin?tab=beta'}
            className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-600 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
          >
            <span className="text-2xl">📝</span>
            <div className="text-left">
              <p className="font-semibold text-gray-900 dark:text-white">Review Applications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stats.betaApplications} waiting</p>
            </div>
          </button>

          <button
            onClick={() => alert('Manual detection triggered!')}
            className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-600 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
          >
            <span className="text-2xl">🔍</span>
            <div className="text-left">
              <p className="font-semibold text-gray-900 dark:text-white">Run Detection</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manual scan</p>
            </div>
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Anti-Gaming Protection
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-green-500 text-xl">✓</span>
              <span className="text-gray-700 dark:text-gray-300">Velocity limiting active</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-500 text-xl">✓</span>
              <span className="text-gray-700 dark:text-gray-300">Self-engagement blocked</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-500 text-xl">✓</span>
              <span className="text-gray-700 dark:text-gray-300">Daily auto-detection (2 AM UTC)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-500 text-xl">✓</span>
              <span className="text-gray-700 dark:text-gray-300">Quality scoring enabled</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Platform Limits
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Rate Limit</span>
              <span className="font-semibold text-gray-900 dark:text-white">20 / 5 min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Daily Cap</span>
              <span className="font-semibold text-gray-900 dark:text-white">10,000 tokens</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Quality Threshold</span>
              <span className="font-semibold text-gray-900 dark:text-white">&lt; 30 holds</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Diversity Threshold</span>
              <span className="font-semibold text-gray-900 dark:text-white">&lt; 0.3 flags</span>
            </div>
          </div>
        </div>

        <div className={`rounded-lg shadow p-6 ${
          stats.earnings.mode === 'BETA'
            ? 'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800'
            : 'bg-white dark:bg-gray-800'
        }`}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Earnings Mode
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Current Mode</span>
              <span className={`font-bold ${
                stats.earnings.mode === 'BETA' ? 'text-orange-600' : 'text-green-600'
              }`}>
                {stats.earnings.mode}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Today's Earnings</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ${stats.earnings.today.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Pending Payout</span>
              <span className="font-semibold text-orange-600">
                ${stats.earnings.pending.toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => window.location.href = '/admin?tab=mode'}
              className="w-full mt-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
            >
              View Mode Details →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
