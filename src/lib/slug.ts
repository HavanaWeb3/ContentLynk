import slugify from 'slugify'
import { prisma } from './db'

/**
 * Generates a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  })
}

/**
 * Ensures a slug is unique by appending a number if necessary
 */
export async function generateUniqueSlug(title: string, userId: string, excludePostId?: string): Promise<string> {
  let slug = generateSlug(title)
  let counter = 1
  let isUnique = false

  while (!isUnique) {
    const existing = await prisma.post.findFirst({
      where: {
        slug: slug,
        authorId: userId,
        ...(excludePostId ? { id: { not: excludePostId } } : {}),
      },
    })

    if (!existing) {
      isUnique = true
    } else {
      slug = `${generateSlug(title)}-${counter}`
      counter++
    }
  }

  return slug
}

/**
 * Calculates estimated reading time for an article
 * Based on average reading speed of 200 words per minute
 */
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200
  const wordCount = text.trim().split(/\s+/).length
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return Math.max(1, minutes) // Minimum 1 minute
}

/**
 * Generates an excerpt from article content
 */
export function generateExcerpt(text: string, maxLength: number = 160): string {
  const cleaned = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

  if (cleaned.length <= maxLength) {
    return cleaned
  }

  return cleaned.substring(0, maxLength).trim() + '...'
}
