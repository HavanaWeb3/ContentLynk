'use client';

import { useEffect, useState } from 'react';
import { analyzeUserForBot, type BotAnalysisResult, type UserFilterType } from '@/lib/utils/bot-detection';

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

interface UserWithBotAnalysis extends User {
  botAnalysis: BotAnalysisResult;
}

interface UserStats {
  total: number;
  verified: number;
  unverified: number;
  today: number;
  likelyBots: number;
  suspicious: number;
}

type FilterType = 'ALL' | 'VERIFIED' | 'UNVERIFIED' | 'LIKELY_BOTS' | 'SUSPICIOUS' | 'ADMIN';

export default function UsersTab() {
  const [users, setUsers] = useState<UserWithBotAnalysis[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    verified: 0,
    unverified: 0,
    today: 0,
    likelyBots: 0,
    suspicious: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithBotAnalysis | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/api/admin/users';
      const params = new URLSearchParams();

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        // Add bot analysis to each user
        const usersWithAnalysis: UserWithBotAnalysis[] = data.users.map((user: User) => ({
          ...user,
          botAnalysis: analyzeUserForBot({
            username: user.username,
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName,
            createdAt: user.createdAt,
            _count: user._count
          })
        }));

        setUsers(usersWithAnalysis);

        // Calculate bot stats
        let likelyBots = 0;
        let suspicious = 0;
        usersWithAnalysis.forEach((user: UserWithBotAnalysis) => {
          if (user.botAnalysis.isLikelyBot) likelyBots++;
          else if (user.botAnalysis.isSuspicious) suspicious++;
        });

        setStats({
          ...data.stats,
          likelyBots,
          suspicious
        });
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

  // Filter users based on current filter
  const filteredUsers = users.filter(user => {
    if (filter === 'ALL') return true;
    if (filter === 'VERIFIED') return user.emailVerified;
    if (filter === 'UNVERIFIED') return !user.emailVerified;
    if (filter === 'LIKELY_BOTS') return user.botAnalysis.isLikelyBot;
    if (filter === 'SUSPICIOUS') return user.botAnalysis.isSuspicious;
    if (filter === 'ADMIN') return user.isAdmin;
    return true;
  }).filter(user => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(term) ||
      (user.email?.toLowerCase().includes(term)) ||
      (user.displayName?.toLowerCase().includes(term))
    );
  });

  const handleSelectAll = () => {
    if (filter !== 'LIKELY_BOTS') return;
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleSelectUser = (userId: string) => {
    if (filter !== 'LIKELY_BOTS') return;
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleDeleteUser = async (user: UserWithBotAnalysis) => {
    if (user.isAdmin) {
      alert('Cannot delete admin accounts');
      return;
    }
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    // Require reason for verified users
    if (userToDelete.emailVerified && !deleteReason.trim()) {
      alert('Please provide a reason for deleting a verified user');
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Deletion-Reason': deleteReason || 'Bot account cleanup'
        }
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userToDelete.id));
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          verified: userToDelete.emailVerified ? prev.verified - 1 : prev.verified,
          unverified: !userToDelete.emailVerified ? prev.unverified - 1 : prev.unverified,
          likelyBots: userToDelete.botAnalysis.isLikelyBot ? prev.likelyBots - 1 : prev.likelyBots,
          suspicious: userToDelete.botAnalysis.isSuspicious ? prev.suspicious - 1 : prev.suspicious
        }));
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        setDeleteReason('');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      alert('Failed to delete user');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;

    // Verify all selected are likely bots
    const selectedUsersList = users.filter(u => selectedUsers.has(u.id));
    const hasVerified = selectedUsersList.some(u => u.emailVerified);
    const hasAdmin = selectedUsersList.some(u => u.isAdmin);

    if (hasAdmin) {
      alert('Cannot delete admin accounts');
      return;
    }

    if (hasVerified) {
      alert('Cannot bulk delete verified users. Please remove them individually.');
      return;
    }

    setBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch('/api/admin/users/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: Array.from(selectedUsers),
          confirmedBotsOnly: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(users.filter(u => !selectedUsers.has(u.id)));
        setStats(prev => ({
          ...prev,
          total: prev.total - data.deletedCount,
          unverified: prev.unverified - data.deletedCount,
          likelyBots: prev.likelyBots - data.deletedCount
        }));
        setSelectedUsers(new Set());
        setBulkDeleteConfirm(false);
        alert(`Successfully deleted ${data.deletedCount} bot accounts`);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete users');
      }
    } catch (err) {
      alert('Failed to delete users');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const getBotIndicator = (user: UserWithBotAnalysis) => {
    if (user.isAdmin) {
      return <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">PROTECTED</span>;
    }
    if (user.botAnalysis.isLikelyBot) {
      return <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">BOT</span>;
    }
    if (user.botAnalysis.isSuspicious) {
      return <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">REVIEW</span>;
    }
    return null;
  };

  const getVerificationBadge = (emailVerified: boolean, phoneVerified: boolean) => {
    if (emailVerified && phoneVerified) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Verified</span>;
    } else if (emailVerified) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Email</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Unverified</span>;
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
            User Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View, filter, and manage user accounts with bot detection
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.verified}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Verified</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.unverified}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Unverified</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.likelyBots}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Likely Bots</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.suspicious}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Suspicious</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.today}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Today</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Filter:</span>
            {[
              { key: 'ALL', label: 'All', count: stats.total },
              { key: 'VERIFIED', label: 'Verified', count: stats.verified },
              { key: 'UNVERIFIED', label: 'Unverified', count: stats.unverified },
              { key: 'LIKELY_BOTS', label: 'Likely Bots', count: stats.likelyBots, danger: true },
              { key: 'SUSPICIOUS', label: 'Suspicious', count: stats.suspicious, warning: true },
              { key: 'ADMIN', label: 'Admin', count: users.filter(u => u.isAdmin).length }
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setFilter(f.key as FilterType);
                  setSelectedUsers(new Set());
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === f.key
                    ? f.danger
                      ? 'bg-red-600 text-white'
                      : f.warning
                      ? 'bg-orange-600 text-white'
                      : 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
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

        {/* Bulk Actions */}
        {filter === 'LIKELY_BOTS' && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {selectedUsers.size === filteredUsers.length ? 'Deselect All' : 'Select All'}
            </button>
            {selectedUsers.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                Delete Selected ({selectedUsers.size})
              </button>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Bulk delete is only available for likely bot accounts
            </span>
          </div>
        )}
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
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No users found</p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">
              {filter !== 'ALL' ? 'Try changing the filter' : 'Users will appear here when they sign up'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <tr>
                  {filter === 'LIKELY_BOTS' && (
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </th>
                  )}
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
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    user.botAnalysis.isLikelyBot ? 'bg-red-50 dark:bg-red-900/10' :
                    user.botAnalysis.isSuspicious ? 'bg-orange-50 dark:bg-orange-900/10' : ''
                  }`}>
                    {filter === 'LIKELY_BOTS' && (
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white flex items-center">
                            {user.displayName || user.username}
                            {user.isAdmin && <span className="ml-2 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-0.5 rounded">ADMIN</span>}
                            {getBotIndicator(user)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email || 'No email'}</div>
                          {user.botAnalysis.indicators.length > 0 && (
                            <div className="text-xs text-red-500 dark:text-red-400 mt-1">
                              {user.botAnalysis.indicators.join(' | ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getVerificationBadge(user.emailVerified, user.phoneVerified)}
                      {user.walletAddress && (
                        <div className="mt-1">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            Wallet
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => {
                          alert(`User Details:\n\nID: ${user.id}\nUsername: ${user.username}\nEmail: ${user.email || 'None'}\nDisplay Name: ${user.displayName || 'None'}\nEmail Verified: ${user.emailVerified}\nPhone Verified: ${user.phoneVerified}\nAdmin: ${user.isAdmin}\nTier: ${user.membershipTier}\nStatus: ${user.status || 'ACTIVE'}\nWallet: ${user.walletAddress || 'None'}\nSignup IP: ${user.signupIp || 'Unknown'}\n\nBot Analysis:\nScore: ${user.botAnalysis.score}/100\nIs Likely Bot: ${user.botAnalysis.isLikelyBot}\nIs Suspicious: ${user.botAnalysis.isSuspicious}\nIndicators: ${user.botAnalysis.indicators.join(', ') || 'None'}\n\nActivity:\nPosts: ${user._count.posts}\nFollowers: ${user._count.followers}\nFollowing: ${user._count.following}`);
                        }}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium"
                      >
                        Details
                      </button>
                      {!user.isAdmin && (
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-medium"
                        >
                          Delete
                        </button>
                      )}
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
          <strong>Bot Detection:</strong> Users are analyzed for bot-like behavior including random usernames, unverified emails, and zero activity. Likely bots can be bulk deleted. Verified users require a reason for deletion.
        </p>
      </div>

      {/* Single Delete Confirmation Dialog */}
      {deleteDialogOpen && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {userToDelete.emailVerified ? 'Delete Verified User' : 'Delete User'}
            </h3>

            {userToDelete.emailVerified && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Warning:</strong> This is a verified user. Please provide a reason for deletion.
                </p>
              </div>
            )}

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete <strong>{userToDelete.username}</strong> ({userToDelete.email || 'No email'})?
            </p>

            {userToDelete.botAnalysis.indicators.length > 0 && (
              <div className="mb-4 text-sm">
                <p className="font-medium text-gray-700 dark:text-gray-300">Bot indicators:</p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                  {userToDelete.botAnalysis.indicators.map((ind, i) => (
                    <li key={i}>{ind}</li>
                  ))}
                </ul>
              </div>
            )}

            {userToDelete.emailVerified && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason for deletion (required):
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Enter reason..."
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setUserToDelete(null);
                  setDeleteReason('');
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={deleting || (userToDelete.emailVerified && !deleteReason.trim())}
              >
                {deleting ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Dialog */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Bulk Delete Bot Accounts
            </h3>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete <strong>{selectedUsers.size}</strong> likely bot accounts?
              This action cannot be undone.
            </p>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                All selected accounts will be permanently deleted along with their posts, comments, and associated data.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setBulkDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : `Delete ${selectedUsers.size} Accounts`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
