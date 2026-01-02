'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { X, UserPlus } from 'lucide-react'
import Link from 'next/link'

export function ReadingProgressBar() {
  const { data: session } = useSession()
  const [progress, setProgress] = useState(0)
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)
  const [hasShownPrompt, setHasShownPrompt] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY

      const totalScrollable = documentHeight - windowHeight
      const scrollProgress = (scrollTop / totalScrollable) * 100

      setProgress(Math.min(scrollProgress, 100))

      // Show signup prompt at 50% scroll for non-authenticated users
      if (!session && !hasShownPrompt && scrollProgress >= 50) {
        setShowSignupPrompt(true)
        setHasShownPrompt(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll)
  }, [session, hasShownPrompt])

  return (
    <>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Signup Prompt Modal */}
      {showSignupPrompt && !session && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={() => setShowSignupPrompt(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                You're halfway through!
              </h3>
              <p className="text-gray-600">
                Join Contentlynk to save articles, leave comments, and support creators
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/auth/signup"
                className="block w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-center hover:shadow-lg transition-all"
              >
                Sign Up Free
              </Link>
              <Link
                href="/auth/signin"
                className="block w-full px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold text-center hover:bg-gray-50 transition-colors"
              >
                I already have an account
              </Link>
            </div>

            <button
              onClick={() => setShowSignupPrompt(false)}
              className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Continue reading without signing up
            </button>
          </div>
        </div>
      )}
    </>
  )
}
