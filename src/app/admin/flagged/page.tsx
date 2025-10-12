'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function FlaggedPostsAdmin() {
  const router = useRouter()

  // Redirect to unified admin dashboard
  useEffect(() => {
    router.push('/admin?tab=flagged')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting to admin dashboard...</p>
      </div>
    </div>
  )
}
