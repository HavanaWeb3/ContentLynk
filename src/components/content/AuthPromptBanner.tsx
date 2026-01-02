'use client'

import Link from 'next/link'
import { LogIn, UserPlus } from 'lucide-react'

export function AuthPromptBanner() {
  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-lg">Enjoying this article?</h3>
            <p className="text-sm text-indigo-100">
              Sign up to like, comment, bookmark, and support the author
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-700 text-white rounded-lg font-medium hover:bg-indigo-800 transition-colors border border-white/20"
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
