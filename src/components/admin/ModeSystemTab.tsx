'use client';

import { useEffect, useState } from 'react';

interface ModeConfig {
  mode: string;
  beta_config: any;
  natural_config: any;
}

export default function ModeSystemTab() {
  const [config, setConfig] = useState<ModeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [warnings, setWarnings] = useState<any[]>([]);
  const [probationUsers, setProbationUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchModeSystemData();
  }, []);

  const fetchModeSystemData = async () => {
    setLoading(true);
    try {
      // Fetch platform config
      const configRes = await fetch('/api/admin/mode-system/config');
      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(configData);
      }

      // Fetch warnings summary
      const warningsRes = await fetch('/api/admin/mode-system/warnings');
      if (warningsRes.ok) {
        const warningsData = await warningsRes.json();
        setWarnings(warningsData.warnings || []);
      }

      // Fetch probation users
      const probationRes = await fetch('/api/admin/mode-system/probation');
      if (probationRes.ok) {
        const probationData = await probationRes.json();
        setProbationUsers(probationData.users || []);
      }
    } catch (error) {
      console.error('Error fetching mode system data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading mode system...</p>
      </div>
    );
  }

  const currentMode = config?.mode?.replace(/"/g, '') || 'BETA';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🔧 Mode System
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Platform mode configuration and warning system
          </p>
        </div>
        <button
          onClick={fetchModeSystemData}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Current Mode Status */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Current Platform Mode</h3>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold">{currentMode}</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {currentMode === 'BETA' ? '🧪 Testing Phase' : '🌟 Production Mode'}
              </span>
            </div>
          </div>
          <div className="text-6xl opacity-50">
            {currentMode === 'BETA' ? '🧪' : '🌟'}
          </div>
        </div>
        <p className="mt-4 text-indigo-100">
          {currentMode === 'BETA'
            ? 'Strict caps and immediate blocking for testing phase'
            : 'Warning system with trust-based probation for production'}
        </p>
      </div>

      {/* Mode Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BETA Mode */}
        <div className={`rounded-lg border-2 p-6 ${
          currentMode === 'BETA'
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🧪</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">BETA Mode</h3>
            {currentMode === 'BETA' && (
              <span className="ml-auto px-2 py-1 bg-indigo-600 text-white text-xs rounded-full">
                ACTIVE
              </span>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Daily Cap</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {config?.beta_config?.daily_cap || 10000} tokens/day maximum
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Rate Limiting</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {config?.beta_config?.rate_limit_max || 20} actions per {config?.beta_config?.rate_limit_window || 5} minutes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Immediate Blocking</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Suspicious activity blocked instantly
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Manual Review</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Flagged posts require admin approval
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* NATURAL Mode */}
        <div className={`rounded-lg border-2 p-6 ${
          currentMode === 'NATURAL'
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🌟</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">NATURAL Mode</h3>
            {currentMode === 'NATURAL' && (
              <span className="ml-auto px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                ACTIVE
              </span>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">✓</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">No Hard Caps</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Unlimited earning potential
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">✓</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Warning System</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Progressive warnings before action
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">✓</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Trust Scoring</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Range: -1000 to +1000 points
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">✓</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Probation System</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  7-day probation with earnings hold
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">⚠️</span>
            <span className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {warnings.length}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Active Warnings</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Last 30 days
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🔒</span>
            <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {probationUsers.length}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Users in Probation</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Currently restricted
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🛡️</span>
            <span className="text-3xl font-bold text-green-600 dark:text-green-400">
              ON
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Protection Active</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Anti-gaming enabled
          </p>
        </div>
      </div>

      {/* Database Schema Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          📊 Database Schema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">New Tables</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">creator_warnings</code>
                <span className="text-gray-500 dark:text-gray-400">- Warning tracking</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">platform_config</code>
                <span className="text-gray-500 dark:text-gray-400">- Mode settings</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">New Columns</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">users.trust_score</code>
                <span className="text-gray-500 dark:text-gray-400">- Trust level</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">users.status</code>
                <span className="text-gray-500 dark:text-gray-400">- Probation status</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">earnings.held_until</code>
                <span className="text-gray-500 dark:text-gray-400">- Hold timing</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-3">
          🚀 Coming Soon (Post-Beta)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400">▸</span>
              <span className="text-gray-700 dark:text-gray-300">Warning management UI</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400">▸</span>
              <span className="text-gray-700 dark:text-gray-300">Mode switching interface</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400">▸</span>
              <span className="text-gray-700 dark:text-gray-300">Trust score visualization</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400">▸</span>
              <span className="text-gray-700 dark:text-gray-300">Probation management</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400">▸</span>
              <span className="text-gray-700 dark:text-gray-300">Threshold configuration</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400">▸</span>
              <span className="text-gray-700 dark:text-gray-300">Appeal system</span>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Link */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong>📚 Documentation:</strong> Full mode system documentation available at{' '}
          <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
            MODE_SYSTEM_DOCUMENTATION.md
          </code>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          Database migration: <code>add_mode_system_complete.sql</code> (deployed Oct 12, 2025)
        </p>
      </div>
    </div>
  );
}
