'use client';

import { useState, useEffect } from 'react';
import { PostCard } from './PostCard';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';

interface Post {
  id: string;
  title: string | null;
  content: string;
  imageUrl: string | null;
  videoUrl: string | null;
  videoThumbnail: string | null;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName: string | null;
    avatar: string | null;
    membershipTier: string;
  };
  isLikedByUser: boolean;
  postComments: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: {
      username: string;
      displayName: string | null;
      avatar: string | null;
    };
  }>;
}

interface FeedProps {
  onMessageCreator?: (userId: string) => void;
}

export function Feed({ onMessageCreator }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPosts = async (offset = 0, append = false) => {
    try {
      if (!append) setIsLoading(true);
      else setIsLoadingMore(true);

      const response = await fetch(
        `/api/feed?limit=${pagination.limit}&offset=${offset}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch feed');
      }

      const data = await response.json();

      if (append) {
        setPosts((prev) => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }

      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (postId: string) => {
    const response = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to like post');
    }

    // Update the post in the feed
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            isLikedByUser: !post.isLikedByUser,
            likes: post.isLikedByUser ? post.likes - 1 : post.likes + 1,
          };
        }
        return post;
      })
    );
  };

  const handleComment = async (postId: string, content: string) => {
    const response = await fetch(`/api/posts/${postId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Failed to post comment');
    }

    const data = await response.json();

    // Update the post in the feed
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments + 1,
            postComments: [data.comment, ...post.postComments.slice(0, 2)],
          };
        }
        return post;
      })
    );
  };

  const handleShare = async (postId: string) => {
    const response = await fetch(`/api/posts/${postId}/share`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to share post');
    }

    // Update the post in the feed
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            shares: post.shares + 1,
          };
        }
        return post;
      })
    );

    // Copy link to clipboard
    const postUrl = `${window.location.origin}/posts/${postId}`;
    await navigator.clipboard.writeText(postUrl);

    // Could show a toast notification here
    alert('Link copied to clipboard!');
  };

  const handleLoadMore = () => {
    fetchPosts(pagination.offset + pagination.limit, true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => fetchPosts()}>Try Again</Button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-2">No posts yet</p>
        <p className="text-sm text-gray-500">
          Be the first to share something with the community!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Feed Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Social Feed</h2>
        <p className="text-gray-600">
          See what other creators are sharing
        </p>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onMessage={onMessageCreator || (() => {})}
          />
        ))}
      </div>

      {/* Load More */}
      {pagination.hasMore && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            variant="outline"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {/* End of Feed */}
      {!pagination.hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>You've reached the end of the feed</p>
        </div>
      )}
    </div>
  );
}
