'use client';

import { useEffect, useState } from 'react';

interface FlaggedPost {
  post_id: string;
  flag_type: string;
  flagged_at: string;
  metadata: {
    diversity_score?: number;
    quality_score?: number;
    flag_reasons?: Array<{ reason: string; value: number | string }>;
  };
  content: string;
  author_username: string;
  author_id: string;
}

export default function FlaggedPostsTab() {
  const [flaggedPosts, setFlaggedPosts] = useState<FlaggedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);

  useEffect(() => {
    fetchFlaggedPosts();
  }, []);

  const fetchFlaggedPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/flagged');
      const data = await res.json();
      setFlaggedPosts(data.flaggedPosts || []);
    } catch (error) {
      console.error('Error fetching flagged posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (postId: string, status: 'CLEARED' | 'CONFIRMED', notes: string) => {
    setReviewing(postId);

    try {
      const res = await fetch('/api/admin/flagged', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, status, notes })
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        setFlaggedPosts(prev => prev.filter(p => p.post_id !== postId));
      } else {
        alert(data.error || 'Failed to review post');
      }
    } catch (error) {
      console.error('Error reviewing post:', error);
      alert('Failed to review post');
    } finally {
      setReviewing(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading flagged posts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🚨 Flagged Posts Review
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Posts flagged by the anti-gaming detection system
          </p>
        </div>
        <button
          onClick={fetchFlaggedPosts}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition"
        >
          🔄 Refresh
        </button>
      </div>

      {flaggedPosts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            ✅ No pending flagged posts!
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            All posts are clean or have been reviewed.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {flaggedPosts.map((post) => (
            <div
              key={post.post_id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    post.flag_type === 'COORDINATED_ENGAGEMENT'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : post.flag_type === 'VELOCITY_SPIKE'
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {post.flag_type.replace(/_/g, ' ')}
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Flagged {new Date(post.flagged_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Quality Score</p>
                  <p className={`text-2xl font-bold ${
                    (post.metadata.quality_score || 100) < 30
                      ? 'text-red-600 dark:text-red-400'
                      : (post.metadata.quality_score || 100) < 50
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {post.metadata.quality_score ?? 'N/A'}/100
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Diversity Score</p>
                  <p className={`text-2xl font-bold ${
                    (post.metadata.diversity_score || 1) < 0.3
                      ? 'text-red-600 dark:text-red-400'
                      : (post.metadata.diversity_score || 1) < 0.5
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {post.metadata.diversity_score?.toFixed(2) ?? 'N/A'}
                  </p>
                </div>
              </div>

              {/* Flag Reasons */}
              {post.metadata.flag_reasons && post.metadata.flag_reasons.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Detection Reasons:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {post.metadata.flag_reasons.map((reason, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                        {reason.reason.replace(/_/g, ' ')}: {typeof reason.value === 'number' ? reason.value.toFixed(2) : reason.value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Post Content */}
              <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-900 rounded">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Post Content:
                </p>
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {post.content}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  By: <span className="font-semibold">{post.author_username}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    const notes = prompt('Why are you clearing this post? (optional)');
                    if (notes !== null) {
                      handleReview(post.post_id, 'CLEARED', notes || 'False positive - organic growth');
                    }
                  }}
                  disabled={reviewing === post.post_id}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition disabled:opacity-50"
                >
                  {reviewing === post.post_id ? 'Processing...' : '✅ Clear (False Positive)'}
                </button>
                <button
                  onClick={() => {
                    const notes = prompt('Evidence of gaming activity:', 'Confirmed coordinated engagement pattern');
                    if (notes) {
                      handleReview(post.post_id, 'CONFIRMED', notes);
                    }
                  }}
                  disabled={reviewing === post.post_id}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition disabled:opacity-50"
                >
                  {reviewing === post.post_id ? 'Processing...' : '🚫 Confirm Gaming'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
