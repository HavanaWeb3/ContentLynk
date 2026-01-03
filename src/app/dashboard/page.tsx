'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { WalletConnection } from '@/components/web3/WalletConnection'
import { NFTHoldings } from '@/lib/nftVerification'
import { formatEarnings, calculateEarningsWithTier } from '@/lib/earnings'
import { MembershipTier } from '@/types/membership'
import { Feed } from '@/components/feed/Feed'
import { MessagesPanel } from '@/components/messages/MessagesPanel'
import { MessageDialog } from '@/components/messages/MessageDialog'

interface Post {
  id: string
  title: string | null
  content: string
  slug: string | null
  contentType: string
  imageUrl: string | null
  createdAt: string
  views: number
  likes: number
  comments: number
  shares: number
  earnings: number
  author: {
    username: string
    displayName: string | null
  }
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const { isConnected } = useAccount()
  const router = useRouter()
  const [membershipTier, setMembershipTier] = useState<MembershipTier>(MembershipTier.STANDARD)
  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [nftHoldings, setNftHoldings] = useState<NFTHoldings | null>(null)
  const [emailVerified, setEmailVerified] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState<{
    id: string
    name: string
    username: string
    avatar?: string | null
  } | null>(null)

  const fetchUserPosts = async () => {
    if (!session?.user?.id) return

    try {
      setPostsLoading(true)
      const response = await fetch(`/api/posts?userId=${session.user.id}&limit=5`)
      if (response.ok) {
        const { posts } = await response.json()
        // Calculate earnings for each post
        const postsWithEarnings = posts.map((post: any) => ({
          ...post,
          earnings: calculateEarningsWithTier(
            { views: post.views, likes: post.likes, comments: post.comments, shares: post.shares },
            membershipTier
          ).finalEarnings
        }))
        setPosts(postsWithEarnings)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setPostsLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserPosts()
      // Check email verification status
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          if (data.user?.emailVerified) {
            setEmailVerified(true)
          }
        })
        .catch(err => console.error('Error fetching email status:', err))
    }
  }, [session?.user?.id, membershipTier])

  const handleResendVerification = async () => {
    setResendingEmail(true)
    setResendMessage('')

    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setResendMessage('Verification email sent! Please check your inbox.')
      } else {
        setResendMessage(data.error || 'Failed to send verification email')
      }
    } catch (error) {
      setResendMessage('An error occurred. Please try again.')
    } finally {
      setResendingEmail(false)
    }
  }

  const handleDeletePost = async (postId: string, postTitle: string) => {
    const confirmed = confirm(`Are you sure you want to delete the post "${postTitle || 'Untitled Post'}"? This action cannot be undone.`)

    if (!confirmed) return

    try {
      setDeletingPostId(postId)

      const response = await fetch(`/api/posts?postId=${postId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete post')
      }

      // Remove post from local state
      setPosts(posts.filter(post => post.id !== postId))
      alert('Post deleted successfully!')
    } catch (error) {
      console.error('Error deleting post:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete post. Please try again.')
    } finally {
      setDeletingPostId(null)
    }
  }

  const handleEditPost = (postId: string) => {
    router.push(`/edit/${postId}`)
  }

  const getPostPublicUrl = (post: Post) => {
    if (!post.slug) return null

    const username = post.author.username

    // Determine the route based on content type
    if (post.contentType === 'ARTICLE') {
      return `/${username}/articles/${post.slug}`
    } else if (post.contentType === 'VIDEO') {
      return `/${username}/videos/${post.slug}`
    }

    return null
  }

  const handleViewPost = (post: Post) => {
    const url = getPostPublicUrl(post)
    if (url) {
      router.push(url)
    }
  }

  const handleMembershipUpdate = (holdings: NFTHoldings) => {
    setMembershipTier(holdings.membershipTier)
    setNftHoldings(holdings)
  }

  const handleMessageCreator = async (userId: string) => {
    try {
      // Fetch user info
      const response = await fetch(`/api/user/profile?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedRecipient({
          id: userId,
          name: data.user.displayName || data.user.username,
          username: data.user.username,
          avatar: data.user.avatar,
        })
        setMessageDialogOpen(true)
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
      alert('Failed to load user information')
    }
  }

  // Calculate stats based on actual posts
  const stats = {
    posts: posts.length,
    views: posts.reduce((total, post) => total + post.views, 0),
    likes: posts.reduce((total, post) => total + post.likes, 0),
    followers: 0, // Placeholder - no followers system yet
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const getTierEmoji = (tier: MembershipTier) => {
    switch (tier) {
      case MembershipTier.GENESIS: return '👑'
      case MembershipTier.PLATINUM: return '💎'
      case MembershipTier.GOLD: return '🏆'
      case MembershipTier.SILVER: return '🥈'
      default: return '⭐'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {session.user?.displayName || session.user?.username}!
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-gray-600">Here's your creator dashboard</p>
                  {membershipTier && (
                    <Badge className={
                      membershipTier === MembershipTier.GENESIS
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                        : membershipTier === MembershipTier.PLATINUM
                        ? 'bg-purple-100 text-purple-800 border-purple-300'
                        : membershipTier === MembershipTier.GOLD
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                        : membershipTier === MembershipTier.SILVER
                        ? 'bg-gray-100 text-gray-800 border-gray-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                    }>
                      {getTierEmoji(membershipTier)} {membershipTier}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <WalletConnection
                onMembershipUpdate={handleMembershipUpdate}
                showFullCard={false}
              />
              {session.user?.isAdmin && (
                <Button
                  onClick={() => router.push('/admin/beta-applications')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  🔧 Admin
                </Button>
              )}
              <Button
                onClick={() => router.push('/profile/edit')}
                variant="outline"
                className="bg-white"
              >
                Edit Profile
              </Button>
              <Button
                onClick={() => router.push('/create')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Create Post
              </Button>
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Email Verification Banner */}
      {!emailVerified && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Please verify your email address to access all platform features.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {resendMessage && (
                  <span className="text-sm text-yellow-700">{resendMessage}</span>
                )}
                <button
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                  className="text-sm font-medium text-yellow-900 hover:text-yellow-700 underline disabled:opacity-50"
                >
                  {resendingEmail ? 'Sending...' : 'Resend Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Web3 Connection Prompt - Only show if not connected */}
        {!isConnected && (
          <Card className="border-indigo-200 bg-indigo-50">
            <CardContent className="p-6">
              <WalletConnection onMembershipUpdate={handleMembershipUpdate} />
            </CardContent>
          </Card>
        )}

        {/* Earnings Overview */}
        {/* <EarningsDisplay membershipTier={membershipTier} /> */}

        {/* Performance Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Posts</CardDescription>
                <CardTitle className="text-3xl">{stats.posts}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Published content</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Views</CardDescription>
                <CardTitle className="text-3xl">{stats.views.toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Across all posts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Likes</CardDescription>
                <CardTitle className="text-3xl">{stats.likes}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Engagement count</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Followers</CardDescription>
                <CardTitle className="text-3xl">{stats.followers}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Feature coming soon</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Posts Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts Performance</CardTitle>
            <CardDescription>See how your content is performing</CardDescription>
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Loading posts...</span>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No posts yet</p>
                <Button
                  onClick={() => router.push('/create')}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Create Your First Post
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 mr-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {post.title || 'Untitled Post'}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {post.content}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {getPostPublicUrl(post) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewPost(post)}
                                className="text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditPost(post.id)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeletePost(post.id, post.title || 'Untitled')}
                              disabled={deletingPostId === post.id}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              {deletingPostId === post.id ? (
                                <div className="w-4 h-4 mr-1 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                              ) : (
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                              Delete
                            </Button>
                          </div>
                        </div>
                        {post.imageUrl && (
                          <div className="mt-3">
                            <img
                              src={post.imageUrl}
                              alt="Post image"
                              className="max-w-xs rounded-lg shadow-sm"
                            />
                          </div>
                        )}
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                          <span>{post.views} views</span>
                          <span>{post.likes} likes</span>
                          <span>{post.comments} comments</span>
                          <span>{post.shares} shares</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {formatEarnings(post.earnings)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Feed and Messages */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Social Feed - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <Feed onMessageCreator={handleMessageCreator} />
          </div>

          {/* Messages Panel - Takes 1 column on large screens */}
          <div className="lg:col-span-1">
            <MessagesPanel />
          </div>
        </div>

        {/* Message Dialog */}
        {selectedRecipient && (
          <MessageDialog
            isOpen={messageDialogOpen}
            onClose={() => {
              setMessageDialogOpen(false)
              setSelectedRecipient(null)
            }}
            recipientId={selectedRecipient.id}
            recipientName={selectedRecipient.name}
            recipientUsername={selectedRecipient.username}
            recipientAvatar={selectedRecipient.avatar}
          />
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Content</CardTitle>
              <CardDescription>Share your thoughts and start earning</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => router.push('/create')}
              >
                Create Post
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>View Feed</CardTitle>
              <CardDescription>See what other creators are sharing</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/feed')}
              >
                Browse Feed
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Deep dive into your performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/analytics')}
              >
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}