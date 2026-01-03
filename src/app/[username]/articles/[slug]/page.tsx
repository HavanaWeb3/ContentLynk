import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Clock, Calendar, Tag, ArrowLeft, Share2 } from 'lucide-react'
import { ArticleView } from '@/components/content/ArticleView'
import { AuthPromptBanner } from '@/components/content/AuthPromptBanner'
import { LikeButton } from '@/components/content/LikeButton'
import { BookmarkButton } from '@/components/content/BookmarkButton'
import { CommentSection } from '@/components/content/CommentSection'
import { SocialShareButtons } from '@/components/content/SocialShareButtons'
import { ReadingProgressBar } from '@/components/content/ReadingProgressBar'
import { RelatedArticles } from '@/components/content/RelatedArticles'
import { EmailCaptureModal } from '@/components/content/EmailCaptureModal'
import { ArticleAnalytics } from '@/components/analytics/ArticleAnalytics'

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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://contentlynk.com'
  const articleUrl = `${siteUrl}/${username}/articles/${slug}`

  return {
    title: post.metaTitle || post.title || 'Article',
    description: post.metaDescription || post.excerpt || post.content.substring(0, 160),
    keywords: post.metaKeywords || undefined,
    openGraph: {
      title: post.metaTitle || post.title || 'Article',
      description: post.metaDescription || post.excerpt || post.content.substring(0, 160),
      images: post.imageUrl ? [post.imageUrl] : [],
      type: 'article',
      url: articleUrl,
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.displayName || post.author.username],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title || 'Article',
      description: post.metaDescription || post.excerpt || post.content.substring(0, 160),
      images: post.imageUrl ? [post.imageUrl] : [],
    },
    alternates: {
      canonical: articleUrl,
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { username, slug } = params
  const session = await getServerSession(authOptions)

  // Fetch post data
  const post = await prisma.post.findFirst({
    where: {
      slug,
      contentType: 'ARTICLE',
      status: 'PUBLISHED',
      author: { username },
    },
    select: {
      id: true,
      title: true,
      content: true,
      articleContent: true,
      slug: true,
      excerpt: true,
      imageUrl: true,
      category: true,
      tags: true,
      metaTitle: true,
      metaDescription: true,
      readingTime: true,
      totalViews: true,
      likes: true,
      shares: true,
      publishedAt: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          bio: true,
        },
      },
      postComments: {
        include: {
          user: {
            select: {
              username: true,
              displayName: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!post) {
    notFound()
  }

  // Debug: Log what we actually fetched
  console.log('Server-side post data:', {
    title: post.title,
    hasContent: !!post.content,
    contentLength: post.content?.length,
    hasArticleContent: !!post.articleContent,
    articleContentType: typeof post.articleContent,
    articleContentLength: typeof post.articleContent === 'string' ? post.articleContent.length : JSON.stringify(post.articleContent || {}).length
  });

  // Check if user has liked or bookmarked this post
  let isLiked = false
  let isBookmarked = false

  if (session?.user?.id) {
    const [like, bookmark] = await Promise.all([
      prisma.like.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: post.id,
          },
        },
      }),
      prisma.bookmark.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: post.id,
          },
        },
      }),
    ])

    isLiked = !!like
    isBookmarked = !!bookmark
  }

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

  // Transform comments for CommentSection component
  const transformedComments = post.postComments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    user: {
      username: comment.user.username,
      displayName: comment.user.displayName,
      avatar: comment.user.avatar,
    },
  }))

  return (
    <ArticleView postId={post.id}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Show auth prompt banner for non-authenticated users */}
        {!session && <AuthPromptBanner />}

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
                  👁️ {post.totalViews.toLocaleString()} views
                </div>
              </div>

              {/* Engagement Buttons */}
              <div className="flex flex-wrap items-center gap-3 mb-8 pb-8 border-b">
                <LikeButton
                  postId={post.id}
                  initialLikes={post.likes}
                  initialIsLiked={isLiked}
                />
                <BookmarkButton postId={post.id} initialIsBookmarked={isBookmarked} />
                <SocialShareButtons
                  postId={post.id}
                  url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://contentlynk.com'}/${username}/articles/${slug}`}
                  title={post.title || 'Article'}
                  description={post.excerpt || undefined}
                />
              </div>

              {/* Article Body */}
              <div className="prose prose-lg max-w-none">
                {(() => {
                  // Client-side debug
                  console.log('Client-side article data:', {
                    hasContent: !!post.content,
                    contentLength: post.content?.length || 0,
                    hasArticleContent: !!post.articleContent,
                    articleContentType: typeof post.articleContent,
                    contentPreview: post.content?.substring(0, 100),
                    articleContentPreview: typeof post.articleContent === 'string' ? post.articleContent.substring(0, 100) : 'not string'
                  });

                  // Scenario 1: articleContent exists and is a string (HTML)
                  if (post.articleContent && typeof post.articleContent === 'string') {
                    return (
                      <div
                        dangerouslySetInnerHTML={{ __html: post.articleContent }}
                        className="article-content"
                      />
                    );
                  }

                  // Scenario 2: articleContent exists but is JSON/object (Lexical state)
                  if (post.articleContent && typeof post.articleContent === 'object') {
                    console.warn('Article content stored as JSON object');

                    // Try to extract text from JSON structure
                    const jsonContent = post.articleContent as any;

                    // Handle Lexical editor state structure
                    if (jsonContent.root?.children) {
                      try {
                        const extractText = (node: any): string => {
                          if (node.text) return node.text;
                          if (node.children) {
                            return node.children.map(extractText).join('');
                          }
                          return '';
                        };

                        const text = jsonContent.root.children.map(extractText).join('\n\n');
                        if (text) {
                          return (
                            <div
                              className="whitespace-pre-wrap"
                              dangerouslySetInnerHTML={{
                                __html: text.split('\n\n').map((p: string) => `<p>${p}</p>`).join('')
                              }}
                            />
                          );
                        }
                      } catch (e) {
                        console.error('Failed to extract text from JSON:', e);
                      }
                    }
                  }

                  // Scenario 3: Fall back to plain content field
                  if (post.content) {
                    // Check if content has HTML tags
                    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(post.content);

                    if (hasHtmlTags) {
                      // Content has HTML, render it
                      return (
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                      );
                    } else {
                      // Plain text - convert to HTML with paragraphs
                      const htmlContent = post.content
                        .split('\n\n')
                        .filter((p: string) => p.trim())
                        .map((para: string) => `<p>${para.replace(/\n/g, '<br/>')}</p>`)
                        .join('');

                      return (
                        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                      );
                    }
                  }

                  // Scenario 4: No content at all
                  return (
                    <div className="bg-gray-50 border border-gray-200 rounded p-8 text-center">
                      <p className="text-gray-600">No content available for this article.</p>
                    </div>
                  );
                })()}
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

          {/* Analytics Dashboard - Only show to article author */}
          {session?.user?.id === post.author.id && (
            <ArticleAnalytics postId={post.id} />
          )}

          {/* Related Articles */}
          <RelatedArticles
            currentPostId={post.id}
            authorId={post.author.id}
            category={post.category}
            tags={post.tags}
          />

          {/* Comments Section */}
          <CommentSection postId={post.id} initialComments={transformedComments} />
        </main>

        {/* Reading Progress Bar */}
        <ReadingProgressBar />

        {/* Email Capture Modal */}
        <EmailCaptureModal />
      </div>
    </ArticleView>
  )
}
