'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Bookmark } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BookmarkButtonProps {
  postId: string
  initialIsBookmarked?: boolean
}

export function BookmarkButton({ postId, initialIsBookmarked = false }: BookmarkButtonProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked)
  const [isLoading, setIsLoading] = useState(false)

  const handleBookmark = async () => {
    if (status === 'loading') return

    if (!session) {
      // Redirect to sign in
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname))
      return
    }

    setIsLoading(true)
    try {
      const method = isBookmarked ? 'DELETE' : 'POST'
      const response = await fetch(`/api/posts/${postId}/bookmark`, { method })

      if (response.ok) {
        setIsBookmarked(!isBookmarked)
      } else {
        console.error('Failed to bookmark post')
      }
    } catch (error) {
      console.error('Error bookmarking post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleBookmark}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        isBookmarked
          ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${
        !session ? 'cursor-pointer hover:shadow-md' : ''
      }`}
    >
      <Bookmark
        className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`}
      />
      <span>{isBookmarked ? 'Saved' : 'Save'}</span>
    </button>
  )
}
