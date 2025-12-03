import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Clock, Calendar, Tag, ArrowLeft, Eye } from 'lucide-react'
import { VideoPlayer } from '@/components/content/VideoPlayer'

interface VideoPageProps {
  params: {
    username: string
    slug: string
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: VideoPageProps): Promise<Metadata> {
  const { username, slug } = params

  const post = await prisma.post.findFirst({
    where: {
      slug,
      contentType: 'VIDEO',
      status: 'PUBLISHED',
      author: { username },
    },
    include: {
      author: {
        select: {
          username: true,
          displayName: true,
        },
      },
    },
  })

  if (!post) {
    return {
      title: 'Video Not Found',
    }
  }

  const description = post.metaDescription || post.content?.substring(0, 160) || 'Watch this video on ContentLynk'

  return {
    title: post.metaTitle || post.title || 'Video',
    description,
    openGraph: {
      title: post.metaTitle || post.title || 'Video',
      description,
      images: post.videoThumbnail ? [post.videoThumbnail] : [],
      type: 'video.other',
      videos: post.videoUrl ? [{ url: post.videoUrl }] : [],
    },
    twitter: {
      card: 'player',
      title: post.metaTitle || post.title || 'Video',
      description,
      images: post.videoThumbnail ? [post.videoThumbnail] : [],
    },
  }
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { username, slug } = params

  const post = await prisma.post.findFirst({
    where: {
      slug,
      contentType: 'VIDEO',
      status: 'PUBLISHED',
      author: { username },
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          bio: true,
        },
      },
    },
  })

  if (!post || !post.videoUrl) {
    notFound()
  }

  // Increment view count (fire and forget)
  prisma.post.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  }).catch(() => {})

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date(post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/${username}`}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {post.author.displayName || post.author.username}'s profile
          </Link>
        </div>
      </header>

      {/* Video Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player & Info - Main Column */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="bg-black rounded-xl overflow-hidden shadow-2xl aspect-video">
              <VideoPlayer
                url={post.videoUrl}
                thumbnail={post.videoThumbnail || undefined}
                title={post.title || undefined}
                className="w-full h-full"
              />
            </div>

            {/* Video Info */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
              {/* Category & Tags */}
              {(post.category || post.tags.length > 0) && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {post.category && (
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                      {post.category}
                    </span>
                  )}
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {post.title || 'Untitled Video'}
              </h1>

              {/* Metadata Row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {post.views.toLocaleString()} views
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formattedDate}
                </div>

                {post.videoDuration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatDuration(post.videoDuration)}
                  </div>
                )}
              </div>

              {/* Author */}
              <Link
                href={`/${username}`}
                className="flex items-center gap-4 hover:opacity-80 transition-opacity"
              >
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.displayName || post.author.username}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                    {(post.author.displayName || post.author.username).charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-bold text-gray-900">
                    {post.author.displayName || post.author.username}
                  </div>
                  <div className="text-sm text-gray-500">@{post.author.username}</div>
                </div>
              </Link>

              {/* Description */}
              {post.content && (
                <div className="mt-6 pt-6 border-t">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Author Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About the Creator</h2>
              <Link href={`/${username}`} className="block">
                <div className="flex flex-col items-center text-center">
                  {post.author.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.displayName || post.author.username}
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 mb-4"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-3xl mb-4">
                      {(post.author.displayName || post.author.username).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {post.author.displayName || post.author.username}
                  </h3>
                  <p className="text-gray-600 mb-4">@{post.author.username}</p>
                  {post.author.bio && (
                    <p className="text-gray-700 text-sm leading-relaxed">{post.author.bio}</p>
                  )}
                </div>
              </Link>

              <Link
                href={`/${username}`}
                className="mt-6 block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
