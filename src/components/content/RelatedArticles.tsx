import Link from 'next/link'
import { Clock, Eye } from 'lucide-react'
import { prisma } from '@/lib/db'

interface RelatedArticlesProps {
  currentPostId: string
  authorId: string
  category?: string | null
  tags: string[]
}

export async function RelatedArticles({
  currentPostId,
  authorId,
  category,
  tags,
}: RelatedArticlesProps) {
  // Find related articles based on:
  // 1. Same author (prioritized)
  // 2. Same category
  // 3. Shared tags
  const relatedArticles = await prisma.post.findMany({
    where: {
      id: { not: currentPostId },
      contentType: 'ARTICLE',
      status: 'PUBLISHED',
      OR: [
        { authorId: authorId }, // Same author
        category ? { category: category } : {}, // Same category
        tags.length > 0 ? { tags: { hasSome: tags } } : {}, // Shared tags
      ],
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
    orderBy: [
      { publishedAt: 'desc' },
      { totalViews: 'desc' },
    ],
    take: 3,
  })

  if (relatedArticles.length === 0) {
    return null
  }

  return (
    <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>

      <div className="grid gap-6 md:grid-cols-3">
        {relatedArticles.map((article) => (
          <Link
            key={article.id}
            href={`/${article.author.username}/articles/${article.slug}`}
            className="group block"
          >
            <article className="h-full bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              {/* Featured Image */}
              {article.imageUrl && (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title || 'Article'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-4">
                {/* Category */}
                {article.category && (
                  <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium mb-2">
                    {article.category}
                  </span>
                )}

                {/* Title */}
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {article.title || 'Untitled'}
                </h3>

                {/* Excerpt */}
                {article.excerpt && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <img
                      src={article.author.avatar || `https://ui-avatars.com/api/?name=${article.author.username}`}
                      alt={article.author.displayName || article.author.username}
                      className="w-5 h-5 rounded-full"
                    />
                    <span>{article.author.displayName || article.author.username}</span>
                  </div>

                  {article.readingTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{article.readingTime} min</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{article.totalViews.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}
