'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string | null;
  username: string;
  displayName: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  isAdmin: boolean;
  membershipTier: string;
  createdAt: string;
  walletAddress: string | null;
  signupIp: string | null;
  status: string | null;
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
}

interface UserStats {
  total: number;
  verified: number;
  unverified: number;
  today: number;
}

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    verified: 0,
    unverified: 0,
    today: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [filter, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/api/admin/users';
      const params = new URLSearchParams();

      if (filter !== 'ALL') {
        params.append('status', filter.toLowerCase());
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to load users');
      }
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getVerificationBadge = (emailVerified: boolean, phoneVerified: boolean) => {
    if (emailVerified && phoneVerified) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">✓ Verified</span>;
    } else if (emailVerified) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">✓ Email</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">⚠ Unverified</span>;
    }
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      STANDARD: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      SILVER: 'bg-gray-300 text-gray-900 dark:bg-gray-600 dark:text-white',
      GOLD: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      PLATINUM: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      GENESIS: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
    };
    return colors[tier] || colors.STANDARD;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            👥 Registered Users
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage all user accounts
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.total}</div>
          <div className="text-gray-600 dark:text-gray-400 mt-1">Total Users</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.verified}</div>
          <div className="text-gray-600 dark:text-gray-400 mt-1">Email Verified</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.unverified}</div>
          <div className="text-gray-600 dark:text-gray-400 mt-1">Unverified</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.today}</div>
          <div className="text-gray-600 dark:text-gray-400 mt-1">Signed Up Today</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Filter:</span>
            <div className="flex gap-2 flex-wrap">
              {['ALL', 'VERIFIED', 'UNVERIFIED', 'ADMIN'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by email, username, or display name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {error ? (
          <div className="p-12 text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No users found</p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">Users will appear here when they sign up on the main site</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {user.displayName || user.username}
                            {user.isAdmin && <span className="ml-2 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-0.5 rounded">ADMIN</span>}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getVerificationBadge(user.emailVerified, user.phoneVerified)}
                      {user.walletAddress && (
                        <div className="mt-1">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            🔗 Wallet
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTierBadge(user.membershipTier)}`}>
                        {user.membershipTier}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300">{user._count.posts} posts</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user._count.followers} followers</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(user.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          alert(`User Details:\n\nID: ${user.id}\nUsername: ${user.username}\nEmail: ${user.email || 'None'}\nDisplay Name: ${user.displayName || 'None'}\nEmail Verified: ${user.emailVerified}\nPhone Verified: ${user.phoneVerified}\nAdmin: ${user.isAdmin}\nTier: ${user.membershipTier}\nStatus: ${user.status || 'ACTIVE'}\nWallet: ${user.walletAddress || 'None'}\nSignup IP: ${user.signupIp || 'Unknown'}\n\nActivity:\nPosts: ${user._count.posts}\nFollowers: ${user._count.followers}\nFollowing: ${user._count.following}`);
                        }}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>ℹ️ Note:</strong> This shows all users who registered via the main site signup form (/auth/signup). Beta applications are tracked separately in the "Beta Applications" tab.
        </p>
      </div>
    </div>
  );
}
