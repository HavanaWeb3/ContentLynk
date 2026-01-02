import { prisma } from '@/lib/db'
import { Eye, Users, UserCheck, TrendingUp, Share2, Heart, MessageSquare } from 'lucide-react'

interface ArticleAnalyticsProps {
  postId: string
}

export async function ArticleAnalytics({ postId }: ArticleAnalyticsProps) {
  // Fetch article analytics
  const article = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      totalViews: true,
      publicViews: true,
      authenticatedViews: true,
      likes: true,
      comments: true,
      shares: true,
      createdAt: true,
    },
  })

  if (!article) return null

  // Calculate conversion rate (authenticated views / total views)
  const conversionRate = article.totalViews > 0
    ? ((article.authenticatedViews / article.totalViews) * 100).toFixed(1)
    : '0.0'

  // Calculate engagement rate
  const totalEngagements = article.likes + article.comments + article.shares
  const engagementRate = article.totalViews > 0
    ? ((totalEngagements / article.totalViews) * 100).toFixed(1)
    : '0.0'

  // Fetch view timeline (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const viewLogs = await prisma.viewLog.groupBy({
    by: ['isAuthenticated'],
    where: {
      postId: postId,
      viewedAt: { gte: thirtyDaysAgo },
    },
    _count: true,
  })

  const recentPublicViews = viewLogs.find(v => !v.isAuthenticated)?._count || 0
  const recentAuthViews = viewLogs.find(v => v.isAuthenticated)?._count || 0

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-indigo-600" />
        Article Analytics
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Total Views */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-indigo-700 mb-1">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Total Views</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {article.totalViews.toLocaleString()}
          </p>
        </div>

        {/* Public Views */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-purple-700 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Public Views</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {article.publicViews.toLocaleString()}
          </p>
          <p className="text-xs text-purple-600 mt-1">
            {((article.publicViews / Math.max(article.totalViews, 1)) * 100).toFixed(0)}% of total
          </p>
        </div>

        {/* Authenticated Views */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 mb-1">
            <UserCheck className="w-4 h-4" />
            <span className="text-sm font-medium">Auth Views</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {article.authenticatedViews.toLocaleString()}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {conversionRate}% conversion
          </p>
        </div>

        {/* Engagement Rate */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-orange-700 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Engagement</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{engagementRate}%</p>
          <p className="text-xs text-orange-600 mt-1">
            {totalEngagements} interactions
          </p>
        </div>
      </div>

      {/* Engagement Details */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Likes</p>
            <p className="text-lg font-bold text-gray-900">{article.likes}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Comments</p>
            <p className="text-lg font-bold text-gray-900">{article.comments}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Share2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Shares</p>
            <p className="text-lg font-bold text-gray-900">{article.shares}</p>
          </div>
        </div>
      </div>

      {/* Visual Representation */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">View Distribution</h3>
        <div className="flex h-8 rounded-lg overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium"
            style={{ width: `${(article.publicViews / Math.max(article.totalViews, 1)) * 100}%` }}
          >
            {article.publicViews > 0 && (
              <span className="px-2">
                {((article.publicViews / Math.max(article.totalViews, 1)) * 100).toFixed(0)}% Public
              </span>
            )}
          </div>
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white text-sm font-medium"
            style={{ width: `${(article.authenticatedViews / Math.max(article.totalViews, 1)) * 100}%` }}
          >
            {article.authenticatedViews > 0 && (
              <span className="px-2">
                {((article.authenticatedViews / Math.max(article.totalViews, 1)) * 100).toFixed(0)}% Auth
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Last 30 Days */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Last 30 Days</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600">Public Views</p>
            <p className="text-lg font-bold text-purple-600">{recentPublicViews}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Authenticated Views</p>
            <p className="text-lg font-bold text-green-600">{recentAuthViews}</p>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
        <h3 className="text-sm font-semibold text-indigo-900 mb-2">💡 Insights</h3>
        <ul className="space-y-1 text-sm text-indigo-800">
          {parseFloat(conversionRate) > 20 && (
            <li>✨ Great conversion rate! {conversionRate}% of readers are signing up.</li>
          )}
          {parseFloat(conversionRate) < 10 && (
            <li>🎯 Consider adding more signup CTAs to improve your {conversionRate}% conversion rate.</li>
          )}
          {parseFloat(engagementRate) > 5 && (
            <li>🚀 High engagement! Readers are actively interacting with your content.</li>
          )}
          {article.shares > article.likes && (
            <li>📢 Your content is highly shareable! More shares than likes.</li>
          )}
        </ul>
      </div>
    </div>
  )
}
