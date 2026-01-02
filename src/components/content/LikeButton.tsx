'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface LikeButtonProps {
  postId: string
  initialLikes: number
  initialIsLiked?: boolean
}

export function LikeButton({ postId, initialLikes, initialIsLiked = false }: LikeButtonProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isLoading, setIsLoading] = useState(false)

  const handleLike = async () => {
    if (status === 'loading') return

    if (!session) {
      // Redirect to sign in
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname))
      return
    }

    setIsLoading(true)
    try {
      const method = isLiked ? 'DELETE' : 'POST'
      const response = await fetch(`/api/posts/${postId}/like`, { method })

      if (response.ok) {
        setIsLiked(!isLiked)
        setLikes(isLiked ? likes - 1 : likes + 1)
      } else {
        console.error('Failed to like post')
      }
    } catch (error) {
      console.error('Error liking post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        isLiked
          ? 'bg-red-50 text-red-600 hover:bg-red-100'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${
        !session ? 'cursor-pointer hover:shadow-md' : ''
      }`}
    >
      <Heart
        className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}
      />
      <span>{likes}</span>
    </button>
  )
}
