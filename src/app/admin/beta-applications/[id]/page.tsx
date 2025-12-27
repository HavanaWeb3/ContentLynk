'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Reviewer {
  id: string;
  username: string;
  displayName: string | null;
  email: string | null;
}

interface ExistingUser {
  id: string;
  username: string;
  emailVerified: boolean;
  betaTesterNumber: number | null;
  createdAt: string;
}

interface BetaApplication {
  id: string;
  name: string;
  email: string;
  platform: string;
  niche: string;
  posts: number;
  engagement: string;
  reason: string;
  status: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewNotes: string | null;
  applicationNumber: number | null;
  createdAt: string;
  updatedAt: string;
  reviewer: Reviewer | null;
  existingUser: ExistingUser | null;
}

export default function BetaApplicationDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<BetaApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState<'approve' | 'reject' | null>(null);

  // Check authentication
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

  // Fetch application details
  useEffect(() => {
    if (status === 'authenticated' && session?.user.isAdmin) {
      fetchApplication();
    }
  }, [status, session, applicationId]);

  const fetchApplication = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/beta-applications/${applicationId}`);
      const data = await response.json();

      if (response.ok) {
        setApplication(data.application);
      } else {
        setError(data.error || 'Failed to load application');
      }
    } catch (err) {
      setError('Failed to load application');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (action: 'approve' | 'reject') => {
    if (!application) return;

    setProcessing(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/beta-applications/${applicationId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          reviewNotes: reviewNotes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Show success message and redirect
        alert(`✅ Application ${action === 'approve' ? 'approved' : 'rejected'} successfully!\n\n${data.message}`);
        router.push('/admin?tab=beta');
      } else {
        setError(data.error || `Failed to ${action} application`);
      }
    } catch (err) {
      setError(`Failed to ${action} application`);
      console.error(err);
    } finally {
      setProcessing(false);
      setShowConfirm(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      WAITLIST: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading application...</p>
        </div>
      </div>
    );
  }

  // Only render if user is authenticated and admin
  if (!session?.user.isAdmin) {
    return null;
  }

  if (error && !application) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
            <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
            <Link
              href="/admin?tab=beta"
              className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              ← Back to Applications
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!application) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link
              href="/admin?tab=beta"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
            >
              ← Back to Applications
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              Beta Application Review
            </h1>
          </div>
          <div>
            <span className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${getStatusBadge(application.status)}`}>
              {application.status}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Existing User Warning */}
        {application.existingUser && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              ℹ️ User Account Already Exists
            </h3>
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              An account with email <strong>{application.email}</strong> already exists:
            </p>
            <ul className="mt-2 text-sm text-blue-700 dark:text-blue-300 list-disc list-inside">
              <li>Username: <strong>@{application.existingUser.username}</strong></li>
              <li>Beta Tester: <strong>#{application.existingUser.betaTesterNumber || 'N/A'}</strong></li>
              <li>Email Verified: <strong>{application.existingUser.emailVerified ? 'Yes' : 'No'}</strong></li>
              <li>Created: <strong>{new Date(application.existingUser.createdAt).toLocaleDateString()}</strong></li>
            </ul>
            <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              If approved, we'll send them the approval email but won't create a duplicate account.
            </p>
          </div>
        )}

        {/* Application Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Application Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Applicant Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📋 Applicant Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                  <p className="text-gray-900 dark:text-white font-medium">{application.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <p className="text-gray-900 dark:text-white">{application.email}</p>
                </div>
                {application.applicationNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Application #</label>
                    <p className="text-gray-900 dark:text-white font-bold">#{application.applicationNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Platform Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🎨 Creator Profile
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Platform</label>
                  <p className="text-gray-900 dark:text-white capitalize">{application.platform}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Niche</label>
                  <p className="text-gray-900 dark:text-white">{application.niche}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Posts</label>
                  <p className="text-gray-900 dark:text-white">{application.posts} posts/month</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Engagement</label>
                  <p className="text-gray-900 dark:text-white">{application.engagement}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              💭 Why They Want to Join
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-gray-900 dark:text-gray-200 whitespace-pre-wrap">{application.reason}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-gray-500 dark:text-gray-400">Applied On</label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {new Date(application.createdAt).toLocaleString()}
                </p>
              </div>
              {application.reviewedAt && (
                <div>
                  <label className="text-gray-500 dark:text-gray-400">Reviewed On</label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {new Date(application.reviewedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Reviewer Info */}
          {application.reviewer && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                👤 Reviewed By
              </h3>
              <p className="text-gray-900 dark:text-white">
                <strong>{application.reviewer.displayName || application.reviewer.username}</strong>
                <span className="text-gray-500 dark:text-gray-400 ml-2">
                  (@{application.reviewer.username})
                </span>
              </p>
              {application.reviewNotes && (
                <div className="mt-3">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Review Notes</label>
                  <p className="text-gray-900 dark:text-white mt-1">{application.reviewNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Review Actions */}
        {application.status === 'PENDING' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Review Application
            </h2>

            {/* Optional Review Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Review Notes (Optional)
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Add any internal notes about this review (optional)..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirm('approve')}
                disabled={processing}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✅ Approve Application
              </button>
              <button
                onClick={() => setShowConfirm('reject')}
                disabled={processing}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ❌ Reject Application
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {showConfirm === 'approve' ? '✅ Approve Application?' : '❌ Reject Application?'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {showConfirm === 'approve'
                  ? `This will approve ${application.name}'s application and ${application.existingUser ? 'send them an approval email' : 'create their user account with a temporary password'}.`
                  : `This will reject ${application.name}'s application and send them a polite rejection email.`}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleReview(showConfirm)}
                  disabled={processing}
                  className={`flex-1 ${
                    showConfirm === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50`}
                >
                  {processing ? 'Processing...' : 'Confirm'}
                </button>
                <button
                  onClick={() => setShowConfirm(null)}
                  disabled={processing}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
