'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Import tab components
import BetaApplicationsTab from '@/components/admin/BetaApplicationsTab';
import FlaggedPostsTab from '@/components/admin/FlaggedPostsTab';
import OverviewTab from '@/components/admin/OverviewTab';
import ModeSystemTab from '@/components/admin/ModeSystemTab';

type TabType = 'overview' | 'flagged' | 'beta' | 'mode' | 'users' | 'analytics';

function AdminDashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Check authentication and admin status
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin');
      return;
    }

    if (session && !session.user.isAdmin) {
      router.push('/?error=unauthorized');
      return;
    }
  }, [session, status, router]);

  // Set active tab from URL
  useEffect(() => {
    const tab = searchParams.get('tab') as TabType;
    if (tab && ['overview', 'flagged', 'beta', 'mode', 'users', 'analytics'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    window.history.pushState({}, '', `/admin?tab=${tab}`);
  };

  // Show loading state while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render if user is authenticated and admin
  if (!session?.user.isAdmin) {
    return null;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'flagged', label: 'Flagged Posts', icon: '🚨', badge: true },
    { id: 'beta', label: 'Beta Applications', icon: '📝', badge: true },
    { id: 'mode', label: 'Mode System', icon: '🔧' },
    { id: 'users', label: 'Users', icon: '👥', disabled: true },
    { id: 'analytics', label: 'Analytics', icon: '📈', disabled: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                ✓ Logged in as: <span className="font-semibold">{session.user.email}</span>
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && handleTabChange(tab.id as TabType)}
                disabled={tab.disabled}
                className={`
                  flex items-center gap-2 px-6 py-3 font-medium rounded-t-lg transition whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'bg-gray-50 dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : tab.disabled
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && activeTab !== tab.id && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    •
                  </span>
                )}
                {tab.disabled && (
                  <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                    Soon
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'flagged' && <FlaggedPostsTab />}
        {activeTab === 'beta' && <BetaApplicationsTab />}
        {activeTab === 'mode' && <ModeSystemTab />}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              👥 User Management Coming Soon
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              This feature is under development
            </p>
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              📈 Analytics Dashboard Coming Soon
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              This feature is under development
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}
