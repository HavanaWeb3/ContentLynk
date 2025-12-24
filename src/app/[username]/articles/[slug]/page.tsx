import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Clock, Calendar, Tag, ArrowLeft } from 'lucide-react'
import { ArticleWithTracking } from '@/components/tracking/ArticleWithTracking'

interface ArticlePageProps {
  params: {
    username: string
    slug: string
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { username, slug } = params

  const post = await prisma.post.findFirst({
    where: {
      slug,
      contentType: 'ARTICLE',
      status: 'PUBLISHED',
      author: { username },
    },
    include: {
      author: {
        select: {
          username: true,
          displayName: true,
          avatar: true,
        },
      },
    },
  })

  if (!post) {
    return {
      title: 'Article Not Found',
    }
  }

  return {
    title: post.metaTitle || post.title || 'Article',
    description: post.metaDescription || post.excerpt || post.content.substring(0, 160),
    openGraph: {
      title: post.metaTitle || post.title || 'Article',
      description: post.metaDescription || post.excerpt || post.content.substring(0, 160),
      images: post.imageUrl ? [post.imageUrl] : [],
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.displayName || post.author.username],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title || 'Article',
      description: post.metaDescription || post.excerpt || post.content.substring(0, 160),
      images: post.imageUrl ? [post.imageUrl] : [],
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { username, slug } = params

  const post = await prisma.post.findFirst({
    where: {
      slug,
      contentType: 'ARTICLE',
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

  if (!post) {
    notFound()
  }

  // Increment view count (fire and forget)
  prisma.post.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  }).catch(() => {}) // Ignore errors

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/${username}`}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {post.author.displayName || post.author.username}'s profile
          </Link>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Featured Image */}
          {post.imageUrl && (
            <div className="w-full h-96 relative">
              <img
                src={post.imageUrl}
                alt={post.title || 'Article featured image'}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Header */}
          <div className="p-8 md:p-12">
            {/* Category & Tags */}
            {(post.category || post.tags.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
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
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title || 'Untitled Article'}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">{post.excerpt}</p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 text-sm mb-8 pb-8 border-b">
              {/* Author */}
              <Link
                href={`/${username}`}
                className="flex items-center gap-3 hover:text-indigo-600 transition-colors"
              >
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.displayName || post.author.username}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {(post.author.displayName || post.author.username).charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900">
                    {post.author.displayName || post.author.username}
                  </div>
                  <div className="text-xs text-gray-500">@{post.author.username}</div>
                </div>
              </Link>

              {/* Date */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formattedDate}
              </div>

              {/* Reading Time */}
              {post.readingTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {post.readingTime} min read
                </div>
              )}

              {/* Views */}
              <div className="flex items-center gap-2">
                👁️ {post.views.toLocaleString()} views
              </div>
            </div>

            {/* Article Body */}
            <div className="prose prose-lg max-w-none">
              {/* Render article content as HTML with scroll depth tracking */}
              <ArticleWithTracking postId={post.id} content={post.content} />
            </div>
          </div>
        </article>

        {/* Author Bio */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Author</h2>
          <Link href={`/${username}`} className="flex items-start gap-4 hover:opacity-80 transition-opacity">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.displayName || post.author.username}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                {(post.author.displayName || post.author.username).charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {post.author.displayName || post.author.username}
              </h3>
              <p className="text-gray-600 mb-2">@{post.author.username}</p>
              {post.author.bio && (
                <p className="text-gray-700 leading-relaxed">{post.author.bio}</p>
              )}
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
