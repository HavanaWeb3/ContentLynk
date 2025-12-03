import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Calendar, MapPin, Link as LinkIcon, FileText, Video, MessageSquare, Eye, Clock } from 'lucide-react'

interface ProfilePageProps {
  params: {
    username: string
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = params

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      username: true,
      displayName: true,
      bio: true,
      avatar: true,
    },
  })

  if (!user) {
    return {
      title: 'User Not Found',
    }
  }

  const title = user.displayName || user.username
  const description = user.bio || `${title}'s profile on ContentLynk - Content Creator`

  return {
    title: `${title} (@${username})`,
    description,
    openGraph: {
      title: `${title} (@${username})`,
      description,
      images: user.avatar ? [user.avatar] : [],
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: `${title} (@${username})`,
      description,
      images: user.avatar ? [user.avatar] : [],
    },
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = params

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatar: true,
      createdAt: true,
      isVerified: true,
      _count: {
        select: {
          posts: { where: { status: 'PUBLISHED' } },
          followers: true,
          following: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  // Fetch user's published content
  const posts = await prisma.post.findMany({
    where: {
      authorId: user.id,
      status: 'PUBLISHED',
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 50, // Limit to most recent 50 posts
    select: {
      id: true,
      title: true,
      content: true,
      excerpt: true,
      slug: true,
      contentType: true,
      imageUrl: true,
      videoUrl: true,
      videoThumbnail: true,
      videoDuration: true,
      tags: true,
      category: true,
      views: true,
      likes: true,
      readingTime: true,
      createdAt: true,
      publishedAt: true,
    },
  })

  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  // Separate content by type
  const articles = posts.filter(p => p.contentType === 'ARTICLE')
  const videos = posts.filter(p => p.contentType === 'VIDEO')
  const textPosts = posts.filter(p => p.contentType === 'TEXT')

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.displayName || user.username}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-5xl">
                  {(user.displayName || user.username).charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.displayName || user.username}
                </h1>
                {user.isVerified && (
                  <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    ✓ VERIFIED
                  </span>
                )}
              </div>

              <p className="text-gray-600 mb-4">@{user.username}</p>

              {user.bio && (
                <p className="text-gray-700 mb-6 leading-relaxed max-w-2xl">{user.bio}</p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <div>
                  <span className="font-bold text-gray-900">{user._count.posts}</span> Posts
                </div>
                <div>
                  <span className="font-bold text-gray-900">{user._count.followers}</span> Followers
                </div>
                <div>
                  <span className="font-bold text-gray-900">{user._count.following}</span> Following
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Joined {joinedDate}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="mb-8">
          <div className="flex items-center gap-6 border-b border-gray-200">
            <button className="pb-4 border-b-2 border-indigo-600 text-indigo-600 font-semibold">
              All Content ({posts.length})
            </button>
          </div>
        </div>

        {/* Articles Section */}
        {articles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Articles ({articles.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((post) => (
                <Link
                  key={post.id}
                  href={`/${username}/articles/${post.slug}`}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {post.imageUrl && (
                    <div className="w-full h-48 bg-gray-200">
                      <img
                        src={post.imageUrl}
                        alt={post.title || 'Article'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {post.category && (
                      <span className="text-xs font-semibold text-indigo-600 mb-2 block">
                        {post.category}
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {post.title || 'Untitled'}
                    </h3>
                    {post.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        {post.readingTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {post.readingTime} min
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.views}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Videos Section */}
        {videos.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Video className="w-6 h-6" />
              Videos ({videos.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((post) => (
                <Link
                  key={post.id}
                  href={`/${username}/videos/${post.slug}`}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
                >
                  <div className="relative w-full h-48 bg-black">
                    {post.videoThumbnail && (
                      <img
                        src={post.videoThumbnail}
                        alt={post.title || 'Video'}
                        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                      />
                    )}
                    {post.videoDuration && (
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(post.videoDuration)}
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <div className="w-0 h-0 border-l-[16px] border-l-white border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {post.category && (
                      <span className="text-xs font-semibold text-indigo-600 mb-2 block">
                        {post.category}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {post.title || 'Untitled Video'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Text Posts Section */}
        {textPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              Updates ({textPosts.length})
            </h2>
            <div className="space-y-4">
              {textPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed mb-4">
                    {post.content}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views} views
                      </div>
                      {post.likes > 0 && (
                        <div>❤️ {post.likes}</div>
                      )}
                    </div>
                    <div>
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Content Yet</h2>
            <p className="text-gray-600">
              {user.displayName || user.username} hasn't published any content yet.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
