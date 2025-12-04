'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Eye, Heart, MessageCircle, Share2, TrendingUp, Calendar, ArrowLeft } from 'lucide-react'
import { calculateEarningsWithTier } from '@/lib/earnings'
import { MembershipTier } from '@/types/membership'

interface Post {
  id: string
  title: string | null
  content: string
  contentType: string
  slug: string | null
  views: number
  likes: number
  comments: number
  shares: number
  earnings: number
  publishedAt: string | null
  createdAt: string
}

interface AnalyticsData {
  totalViews: number
  totalLikes: number
  totalComments: number
  totalShares: number
  totalEarnings: number
  posts: Post[]
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    totalEarnings: 0,
    posts: [],
  })
  const [membershipTier] = useState<MembershipTier>(MembershipTier.STANDARD)
  const [sortBy, setSortBy] = useState<'views' | 'earnings' | 'date'>('views')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchAnalytics()
    }
  }, [session?.user?.id, membershipTier])

  const fetchAnalytics = async () => {
    if (!session?.user?.id) return

    try {
      setLoading(true)
      const response = await fetch(`/api/posts?userId=${session.user.id}&limit=1000`)

      if (response.ok) {
        const { posts } = await response.json()

        // Calculate earnings for each post
        const postsWithEarnings = posts.map((post: any) => ({
          ...post,
          earnings: calculateEarningsWithTier(
            {
              views: post.views,
              likes: post.likes,
              comments: post.comments,
              shares: post.shares,
            },
            membershipTier
          ).finalEarnings,
        }))

        // Calculate totals
        const totalViews = postsWithEarnings.reduce((sum: number, post: Post) => sum + post.views, 0)
        const totalLikes = postsWithEarnings.reduce((sum: number, post: Post) => sum + post.likes, 0)
        const totalComments = postsWithEarnings.reduce((sum: number, post: Post) => sum + post.comments, 0)
        const totalShares = postsWithEarnings.reduce((sum: number, post: Post) => sum + post.shares, 0)
        const totalEarnings = postsWithEarnings.reduce((sum: number, post: Post) => sum + post.earnings, 0)

        setAnalytics({
          totalViews,
          totalLikes,
          totalComments,
          totalShares,
          totalEarnings,
          posts: postsWithEarnings,
        })
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const sortedPosts = [...analytics.posts].sort((a, b) => {
    if (sortBy === 'views') return b.views - a.views
    if (sortBy === 'earnings') return b.earnings - a.earnings
    if (sortBy === 'date') {
      const dateA = new Date(b.publishedAt || b.createdAt).getTime()
      const dateB = new Date(a.publishedAt || a.createdAt).getTime()
      return dateA - dateB
    }
    return 0
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Draft'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'ARTICLE': return '📰'
      case 'VIDEO': return '🎥'
      case 'TEXT': return '💬'
      default: return '📝'
    }
  }

  // Calculate date range
  const oldestPost = analytics.posts.length > 0
    ? new Date(Math.min(...analytics.posts.map(p => new Date(p.publishedAt || p.createdAt).getTime())))
    : new Date()
  const newestPost = analytics.posts.length > 0
    ? new Date(Math.max(...analytics.posts.map(p => new Date(p.publishedAt || p.createdAt).getTime())))
    : new Date()

  const dateRange = analytics.posts.length > 0
    ? `${oldestPost.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${newestPost.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
    : 'No data yet'

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-1">Track your content performance and earnings</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Data Range</div>
              <div className="text-lg font-semibold text-gray-900">{dateRange}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 opacity-90">
                <Eye className="w-4 h-4" />
                Total Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.totalViews.toLocaleString()}</div>
              <p className="text-xs mt-1 opacity-80">Across {analytics.posts.length} posts</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 opacity-90">
                <Heart className="w-4 h-4" />
                Total Likes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.totalLikes.toLocaleString()}</div>
              <p className="text-xs mt-1 opacity-80">
                {analytics.totalViews > 0
                  ? `${((analytics.totalLikes / analytics.totalViews) * 100).toFixed(1)}% engagement`
                  : 'No engagement yet'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 opacity-90">
                <MessageCircle className="w-4 h-4" />
                Total Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.totalComments.toLocaleString()}</div>
              <p className="text-xs mt-1 opacity-80">Conversations started</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 opacity-90">
                <Share2 className="w-4 h-4" />
                Total Shares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.totalShares.toLocaleString()}</div>
              <p className="text-xs mt-1 opacity-80">Viral reach</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 opacity-90">
                <TrendingUp className="w-4 h-4" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${analytics.totalEarnings.toFixed(2)}</div>
              <p className="text-xs mt-1 opacity-80">{analytics.totalEarnings.toFixed(4)} HVNA</p>
            </CardContent>
          </Card>
        </div>

        {/* Post Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Post Performance Breakdown</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="views">Views</option>
                  <option value="earnings">Earnings</option>
                  <option value="date">Date</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {sortedPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Posts Yet</h3>
                <p className="text-gray-600 mb-6">Create your first post to start tracking analytics</p>
                <Link
                  href="/create"
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Create First Post
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Post</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        <Eye className="w-4 h-4 inline" /> Views
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        <Heart className="w-4 h-4 inline" /> Likes
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        <MessageCircle className="w-4 h-4 inline" /> Comments
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        <Share2 className="w-4 h-4 inline" /> Shares
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Earnings</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPosts.map((post) => {
                      const postUrl = post.slug
                        ? post.contentType === 'ARTICLE'
                          ? `/${session?.user?.username}/articles/${post.slug}`
                          : post.contentType === 'VIDEO'
                          ? `/${session?.user?.username}/videos/${post.slug}`
                          : `/${session?.user?.username}#${post.id}`
                        : `/${session?.user?.username}#${post.id}`

                      return (
                        <tr key={post.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <Link href={postUrl} className="hover:text-indigo-600 transition-colors">
                              <div className="font-medium text-gray-900 line-clamp-1">
                                {post.title || 'Untitled Post'}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {post.content.substring(0, 60)}...
                              </div>
                            </Link>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-xl" title={post.contentType}>
                              {getContentTypeIcon(post.contentType)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center font-medium text-gray-900">
                            {post.views.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-center font-medium text-gray-900">
                            {post.likes}
                          </td>
                          <td className="py-4 px-4 text-center font-medium text-gray-900">
                            {post.comments}
                          </td>
                          <td className="py-4 px-4 text-center font-medium text-gray-900">
                            {post.shares}
                          </td>
                          <td className="py-4 px-4 text-right font-bold text-green-600">
                            ${post.earnings.toFixed(2)}
                          </td>
                          <td className="py-4 px-4 text-center text-sm text-gray-600">
                            {formatDate(post.publishedAt)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insights */}
        {analytics.posts.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Best Performing Post</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const bestPost = [...analytics.posts].sort((a, b) => b.views - a.views)[0]
                  return (
                    <div>
                      <div className="font-medium text-gray-900 mb-2">
                        {bestPost.title || 'Untitled Post'}
                      </div>
                      <div className="text-2xl font-bold text-indigo-600">
                        {bestPost.views.toLocaleString()} views
                      </div>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Average Engagement Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">
                  {analytics.totalViews > 0
                    ? `${((analytics.totalLikes / analytics.totalViews) * 100).toFixed(1)}%`
                    : '0%'}
                </div>
                <p className="text-sm text-gray-600 mt-1">Likes per view</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Average Earnings Per Post</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${analytics.posts.length > 0
                    ? (analytics.totalEarnings / analytics.posts.length).toFixed(2)
                    : '0.00'}
                </div>
                <p className="text-sm text-gray-600 mt-1">Per published post</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
