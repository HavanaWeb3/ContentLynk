'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Send } from 'lucide-react';

interface PostAuthor {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  membershipTier: string;
}

interface PostComment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    username: string;
    displayName: string | null;
    avatar: string | null;
  };
}

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
  author: PostAuthor;
  isLikedByUser: boolean;
  postComments: PostComment[];
}

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => Promise<void>;
  onComment: (postId: string, content: string) => Promise<void>;
  onShare: (postId: string) => Promise<void>;
  onMessage: (userId: string) => void;
}

export function PostCard({ post, onLike, onComment, onShare, onMessage }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLikedByUser);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = async () => {
    const previousState = isLiked;
    const previousCount = likeCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      await onLike(post.id);
    } catch (error) {
      // Revert on error
      setIsLiked(previousState);
      setLikeCount(previousCount);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      await onComment(post.id, commentText);
      setCommentText('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    try {
      await onShare(post.id);
    } catch (error) {
      console.error('Failed to share post:', error);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'GENESIS': return 'text-purple-600';
      case 'PLATINUM': return 'text-gray-700';
      case 'GOLD': return 'text-yellow-600';
      case 'SILVER': return 'text-gray-400';
      default: return 'text-gray-600';
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'GENESIS': return '👑';
      case 'PLATINUM': return '💎';
      case 'GOLD': return '🥇';
      case 'SILVER': return '🥈';
      default: return '';
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        {/* Author Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.author.avatar || undefined} />
              <AvatarFallback>
                {(post.author.displayName || post.author.username).substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-semibold">
                  {post.author.displayName || post.author.username}
                </p>
                {post.author.membershipTier !== 'STANDARD' && (
                  <span className={`text-sm ${getTierColor(post.author.membershipTier)}`}>
                    {getTierBadge(post.author.membershipTier)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">@{post.author.username}</p>
              <p className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMessage(post.author.id)}
            className="flex items-center space-x-1"
          >
            <Send className="h-4 w-4" />
            <span>Message</span>
          </Button>
        </div>

        {/* Post Title */}
        {post.title && (
          <h3 className="text-xl font-bold mb-2">{post.title}</h3>
        )}

        {/* Post Content */}
        <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>

        {/* Post Image */}
        {post.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img
              src={post.imageUrl}
              alt="Post content"
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Post Video */}
        {post.videoUrl && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <video
              src={post.videoUrl}
              poster={post.videoThumbnail || undefined}
              controls
              className="w-full h-auto"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Interaction Buttons */}
        <div className="flex items-center space-x-6 mb-4 pt-4 border-t">
          <button
            onClick={handleLike}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="text-sm font-medium">{likeCount}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{post.comments}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors"
          >
            <Share2 className="h-5 w-5" />
            <span className="text-sm font-medium">{post.shares}</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t">
            {/* Recent Comments */}
            {post.postComments && post.postComments.length > 0 && (
              <div className="space-y-3 mb-4">
                {post.postComments.map((comment) => (
                  <div key={comment.id} className="flex space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user.avatar || undefined} />
                      <AvatarFallback>
                        {(comment.user.displayName || comment.user.username).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-gray-100 rounded-lg p-3">
                      <p className="text-sm font-semibold">
                        {comment.user.displayName || comment.user.username}
                      </p>
                      <p className="text-sm text-gray-800">{comment.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleComment();
                  }
                }}
              />
              <Button
                onClick={handleComment}
                disabled={isSubmitting || !commentText.trim()}
                size="sm"
              >
                Post
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
