import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Eye, Heart, MessageCircle, Share2, Clock, Calendar, Tag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Browse Feed - ContentLynk',
  description: 'Discover amazing content from creators on ContentLynk',
}

interface FeedPageProps {
  searchParams: {
    sort?: string
    page?: string
  }
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const sort = searchParams.sort || 'newest'
  const page = parseInt(searchParams.page || '1')
  const perPage = 20

  // Build orderBy clause based on sort
  let orderBy: any = { publishedAt: 'desc' }

  if (sort === 'popular') {
    orderBy = { views: 'desc' }
  } else if (sort === 'engagement') {
    orderBy = [
      { likes: 'desc' },
      { comments: 'desc' },
      { shares: 'desc' },
    ]
  }

  // Fetch published posts
  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
      },
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        slug: true,
        contentType: true,
        imageUrl: true,
        videoThumbnail: true,
        videoDuration: true,
        tags: true,
        category: true,
        views: true,
        likes: true,
        comments: true,
        shares: true,
        readingTime: true,
        publishedAt: true,
        createdAt: true,
        author: {
          select: {
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    }),
    prisma.post.count({
      where: {
        status: 'PUBLISHED',
      },
    }),
  ])

  const totalPages = Math.ceil(totalCount / perPage)

  const formatDate = (date: Date | null) => {
    if (!date) return 'Recently'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getContentTypeDisplay = (type: string) => {
    switch (type) {
      case 'ARTICLE': return { label: 'Article', icon: '📰', color: 'bg-blue-100 text-blue-700' }
      case 'VIDEO': return { label: 'Video', icon: '🎥', color: 'bg-purple-100 text-purple-700' }
      case 'TEXT': return { label: 'Update', icon: '💬', color: 'bg-green-100 text-green-700' }
      default: return { label: 'Post', icon: '📝', color: 'bg-gray-100 text-gray-700' }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Browse Feed</h1>
              <p className="text-gray-600 mt-1">Discover amazing content from creators</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/create"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Create Content
              </Link>
            </div>
          </div>

          {/* Sort Options */}
          <div className="mt-6 flex items-center gap-2">
            <span className="text-sm text-gray-600 mr-2">Sort by:</span>
            <Link
              href="/feed?sort=newest"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sort === 'newest'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Newest
            </Link>
            <Link
              href="/feed?sort=popular"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sort === 'popular'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Most Popular
            </Link>
            <Link
              href="/feed?sort=engagement"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sort === 'engagement'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Most Engagement
            </Link>
          </div>
        </div>
      </header>

      {/* Feed Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing <strong className="text-gray-900">{posts.length}</strong> of{' '}
              <strong className="text-gray-900">{totalCount}</strong> posts
            </div>
            <div>
              Page <strong className="text-gray-900">{page}</strong> of{' '}
              <strong className="text-gray-900">{totalPages}</strong>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {posts.map((post) => {
            const contentTypeInfo = getContentTypeDisplay(post.contentType)
            const thumbnail = post.videoThumbnail || post.imageUrl
            const postUrl =
              post.contentType === 'ARTICLE'
                ? `/${post.author.username}/articles/${post.slug}`
                : post.contentType === 'VIDEO'
                ? `/${post.author.username}/videos/${post.slug}`
                : `/${post.author.username}#${post.id}`

            return (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow group"
              >
                {/* Thumbnail */}
                {thumbnail && (
                  <Link href={postUrl} className="block relative">
                    <div className="w-full h-48 bg-gray-200 relative">
                      <img
                        src={thumbnail}
                        alt={post.title || 'Post thumbnail'}
                        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                      />
                      {post.contentType === 'VIDEO' && post.videoDuration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                          {formatDuration(post.videoDuration)}
                        </div>
                      )}
                      {post.contentType === 'VIDEO' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Content Type Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${contentTypeInfo.color}`}>
                      {contentTypeInfo.icon} {contentTypeInfo.label}
                    </span>
                    {post.category && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {post.category}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <Link href={postUrl} className="block mb-3">
                    <h2 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {post.title || 'Untitled Post'}
                    </h2>
                  </Link>

                  {/* Excerpt */}
                  {(post.excerpt || post.content) && (
                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                      {post.excerpt || post.content}
                    </p>
                  )}

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{post.tags.length - 3} more</span>
                      )}
                    </div>
                  )}

                  {/* Author */}
                  <Link
                    href={`/${post.author.username}`}
                    className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity"
                  >
                    {post.author.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt={post.author.displayName || post.author.username}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {(post.author.displayName || post.author.username).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {post.author.displayName || post.author.username}
                      </div>
                      <div className="text-xs text-gray-500">@{post.author.username}</div>
                    </div>
                  </Link>

                  {/* Engagement Metrics */}
                  <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1" title="Views">
                        <Eye className="w-4 h-4" />
                        <span>{post.views.toLocaleString()}</span>
                      </div>
                      {post.likes > 0 && (
                        <div className="flex items-center gap-1" title="Likes">
                          <Heart className="w-4 h-4" />
                          <span>{post.likes}</span>
                        </div>
                      )}
                      {post.comments > 0 && (
                        <div className="flex items-center gap-1" title="Comments">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments}</span>
                        </div>
                      )}
                      {post.shares > 0 && (
                        <div className="flex items-center gap-1" title="Shares">
                          <Share2 className="w-4 h-4" />
                          <span>{post.shares}</span>
                        </div>
                      )}
                    </div>
                    {post.contentType === 'ARTICLE' && post.readingTime && (
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="w-3 h-3" />
                        {post.readingTime} min
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(post.publishedAt || post.createdAt)}
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/feed?sort=${sort}&page=${page - 1}`}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ← Previous
              </Link>
            )}

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <Link
                    key={pageNum}
                    href={`/feed?sort=${sort}&page=${pageNum}`}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      pageNum === page
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </Link>
                )
              })}
              {totalPages > 5 && <span className="text-gray-500">...</span>}
            </div>

            {page < totalPages && (
              <Link
                href={`/feed?sort=${sort}&page=${page + 1}`}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Next →
              </Link>
            )}
          </div>
        )}

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Content Yet</h2>
            <p className="text-gray-600 mb-6">Be the first to create content on ContentLynk!</p>
            <Link
              href="/create"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Create First Post
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
