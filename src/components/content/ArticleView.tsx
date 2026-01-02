'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface ArticleViewProps {
  postId: string
  children: React.ReactNode
}

export function ArticleView({ postId, children }: ArticleViewProps) {
  const { data: session, status } = useSession()

  useEffect(() => {
    // Track view when component mounts
    const trackView = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isAuthenticated: !!session,
            userId: session?.user?.id || null,
          }),
        })

        if (!response.ok) {
          console.error('Failed to track view')
        }
      } catch (error) {
        console.error('Error tracking view:', error)
      }
    }

    // Only track once when the session status is determined
    if (status !== 'loading') {
      trackView()
    }
  }, [postId, session, status])

  return <>{children}</>
}
