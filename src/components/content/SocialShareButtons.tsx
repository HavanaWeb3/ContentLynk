'use client'

import { useState } from 'react'
import { Share2, Twitter, Facebook, Linkedin, Link2, Check } from 'lucide-react'

interface SocialShareButtonsProps {
  url: string
  title: string
  description?: string
  postId: string
}

export function SocialShareButtons({ url, title, description, postId }: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const trackShare = async (platform: string) => {
    try {
      await fetch(`/api/posts/${postId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      })
    } catch (error) {
      console.error('Error tracking share:', error)
    }
  }

  const shareToTwitter = () => {
    trackShare('twitter')
    const text = `${title}${description ? ' - ' + description : ''}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, '_blank', 'width=550,height=420')
    setIsOpen(false)
  }

  const shareToFacebook = () => {
    trackShare('facebook')
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    window.open(facebookUrl, '_blank', 'width=550,height=420')
    setIsOpen(false)
  }

  const shareToLinkedIn = () => {
    trackShare('linkedin')
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    window.open(linkedinUrl, '_blank', 'width=550,height=420')
    setIsOpen(false)
  }

  const copyLink = async () => {
    trackShare('copy_link')
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
      >
        <Share2 className="w-5 h-5" />
        Share
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Share Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">Share this article</p>
            </div>

            <div className="p-2">
              <button
                onClick={shareToTwitter}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-[#1DA1F2] rounded-full flex items-center justify-center">
                  <Twitter className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-700">Share on Twitter</span>
              </button>

              <button
                onClick={shareToLinkedIn}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-[#0A66C2] rounded-full flex items-center justify-center">
                  <Linkedin className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-700">Share on LinkedIn</span>
              </button>

              <button
                onClick={shareToFacebook}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center">
                  <Facebook className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-700">Share on Facebook</span>
              </button>

              <div className="my-2 border-t border-gray-100" />

              <button
                onClick={copyLink}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Link2 className="w-5 h-5 text-gray-700" />
                  )}
                </div>
                <span className="font-medium text-gray-700">
                  {copied ? 'Link copied!' : 'Copy link'}
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
