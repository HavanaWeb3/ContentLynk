'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function CreatePost() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please select a JPG, PNG, GIF, or WebP image.')
      return
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('File too large. Please select an image under 5MB.')
      return
    }

    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setSelectedFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let imageUrl = null

      // Upload image first if selected
      if (selectedFile) {
        setUploadingImage(true)
        const formData = new FormData()
        formData.append('file', selectedFile)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json()
          throw new Error(error.error || 'Failed to upload image')
        }

        const { url } = await uploadResponse.json()
        imageUrl = url
        setUploadingImage(false)
      }

      // Create post with or without image
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim() || null,
          content: content.trim(),
          imageUrl,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create post')
      }

      const { post } = await response.json()

      alert('Post created successfully! You\'ll start earning from views and engagement.')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating post:', error)
      alert(error instanceof Error ? error.message : 'Failed to create post. Please try again.')
    } finally {
      setIsLoading(false)
      setUploadingImage(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
              <p className="text-gray-600">Share your content and start earning immediately</p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Post Creation Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Write Your Post</CardTitle>
                <CardDescription>
                  Express yourself and engage with your audience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Post Title (Optional)
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Give your post a catchy title..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      maxLength={100}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-gray-500">
                        {title.length}/100 characters
                      </p>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                      What's on your mind?
                    </label>
                    <textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Share your thoughts, ideas, or stories..."
                      rows={8}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      maxLength={1000}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-gray-500">
                        {content.length}/1000 characters
                      </p>
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Add Image (Optional)
                    </label>

                    {!imagePreview ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="mt-4">
                          <label className="cursor-pointer">
                            <span className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                              Click to upload
                            </span>
                            <span className="text-sm text-gray-600"> or drag and drop</span>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/jpeg,image/png,image/gif,image/webp"
                              onChange={handleImageSelect}
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF, WebP up to 5MB</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-w-full max-h-64 rounded-lg shadow-md mx-auto"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 text-center">
                          {selectedFile?.name} ({((selectedFile?.size || 0) / 1024 / 1024).toFixed(1)}MB)
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/dashboard')}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!content.trim() || isLoading || uploadingImage}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {uploadingImage ? 'Uploading Image...' : isLoading ? 'Publishing...' : 'Publish Post'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Earnings Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Earnings Potential</CardTitle>
                <CardDescription>How you earn from this post</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Views</span>
                    <span className="text-sm text-green-600">0.001 HVNA each</span>
                  </div>
                  <p className="text-xs text-gray-500">Earn from every view your content receives</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Likes</span>
                    <span className="text-sm text-green-600">0.01 HVNA each</span>
                  </div>
                  <p className="text-xs text-gray-500">Higher engagement = higher earnings</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Comments</span>
                    <span className="text-sm text-green-600">0.02 HVNA each</span>
                  </div>
                  <p className="text-xs text-gray-500">Conversations drive value</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Shares</span>
                    <span className="text-sm text-green-600">0.05 HVNA each</span>
                  </div>
                  <p className="text-xs text-gray-500">Viral content earns the most</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Revenue Share</CardTitle>
                <CardDescription>Based on your membership tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-indigo-600">55%</p>
                  <p className="text-sm text-gray-600 mt-1">Standard Member</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Connect your wallet to verify NFT holdings and unlock higher rates up to 75%
                  </p>
                  <Button variant="outline" size="sm" className="mt-3">
                    Connect Wallet
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips for Success</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">Be Authentic</p>
                  <p className="text-gray-600">Share your genuine thoughts and experiences</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Engage Early</p>
                  <p className="text-gray-600">Respond to comments to boost engagement</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Post Consistently</p>
                  <p className="text-gray-600">Regular content builds your audience</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}