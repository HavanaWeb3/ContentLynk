'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { RichTextEditor } from '@/components/content/RichTextEditor'
import { VideoPlayer } from '@/components/content/VideoPlayer'
import { FileVideo, FileText, MessageSquare, Upload, X } from 'lucide-react'

type ContentType = 'TEXT' | 'ARTICLE' | 'VIDEO'

export default function CreateContentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Content type selection
  const [contentType, setContentType] = useState<ContentType>('TEXT')

  // Common fields
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [category, setCategory] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [isDraft, setIsDraft] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Text post fields
  const [content, setContent] = useState('')

  // Article fields
  const [articleContent, setArticleContent] = useState('')
  const [articlePlainText, setArticlePlainText] = useState('')
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null)

  // Video fields
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [videoMetadata, setVideoMetadata] = useState<any>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleFeaturedImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please select a JPG, PNG, GIF, or WebP image.')
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('File too large. Please select an image under 5MB.')
      return
    }

    setFeaturedImage(file)
    const reader = new FileReader()
    reader.onload = (e) => setFeaturedImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please select MP4, MOV, AVI, or WebM.')
      return
    }

    const maxSize = 2 * 1024 * 1024 * 1024 // 2GB
    if (file.size > maxSize) {
      alert('File too large. Maximum size is 2GB.')
      return
    }

    setVideoFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setVideoPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const uploadVideo = async () => {
    if (!videoFile) return null

    setIsUploadingVideo(true)
    setUploadProgress(0)

    try {
      // Step 1: Get presigned URL
      console.log('🔗 Getting presigned URL...')
      const presignedResponse = await fetch('/api/upload/video/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: videoFile.name,
          contentType: videoFile.type,
          fileSize: videoFile.size,
        }),
      })

      if (!presignedResponse.ok) {
        const error = await presignedResponse.json()
        throw new Error(error.error || 'Failed to get upload URL')
      }

      const { uploadUrl, key } = await presignedResponse.json()

      // Step 2: Upload directly to S3 using presigned URL
      console.log('☁️ Uploading video to S3...')
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: videoFile,
        headers: {
          'Content-Type': videoFile.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload video to S3')
      }

      setUploadProgress(50) // Upload complete, now processing

      // Step 3: Process video (extract metadata, generate thumbnail)
      console.log('🔄 Processing video...')
      const processResponse = await fetch('/api/upload/video/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoKey: key,
          filename: videoFile.name,
        }),
      })

      if (!processResponse.ok) {
        const error = await processResponse.json()
        throw new Error(error.error || 'Failed to process video')
      }

      const data = await processResponse.json()
      setUploadProgress(100)
      setVideoMetadata(data.video)

      console.log('✅ Video upload complete!', data.video)
      return data.video
    } catch (error) {
      console.error('Video upload error:', error)
      throw error
    } finally {
      setIsUploadingVideo(false)
    }
  }

  const uploadFeaturedImage = async () => {
    if (!featuredImage) return null

    const formData = new FormData()
    formData.append('file', featuredImage)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload featured image')
    }

    const { url } = await response.json()
    return url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let postData: any = {
        title: title.trim() || null,
        contentType,
        status: isDraft ? 'DRAFT' : 'PUBLISHED',
        tags,
        category: category || null,
        metaDescription: metaDescription || null,
      }

      // Handle content type-specific data
      if (contentType === 'TEXT') {
        if (!content.trim()) {
          alert('Content is required')
          return
        }
        postData.content = content.trim()
      } else if (contentType === 'ARTICLE') {
        if (!articlePlainText.trim()) {
          alert('Article content is required')
          return
        }
        postData.content = articlePlainText
        postData.articleContent = articleContent
        postData.readingTime = Math.ceil(articlePlainText.split(/\s+/).length / 200)

        // Upload featured image
        if (featuredImage) {
          const imageUrl = await uploadFeaturedImage()
          postData.imageUrl = imageUrl
        }
      } else if (contentType === 'VIDEO') {
        if (!videoFile) {
          alert('Video file is required')
          return
        }

        // Upload video
        const videoData = await uploadVideo()
        postData.videoUrl = videoData.url
        postData.videoThumbnail = videoData.thumbnail
        postData.videoDuration = videoData.duration
        postData.content = title || 'Video content' // Required field
      }

      // Create post
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create content')
      }

      const { post } = await response.json()
      alert(isDraft ? 'Draft saved successfully!' : 'Content published successfully!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating content:', error)
      alert(error instanceof Error ? error.message : 'Failed to create content')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Content</h1>
              <p className="text-gray-600">Share your stories, videos, and articles</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Cancel
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Content Type Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Choose Content Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setContentType('TEXT')}
              className={`p-6 rounded-lg border-2 transition-all ${
                contentType === 'TEXT'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="w-8 h-8 mb-2 mx-auto text-indigo-600" />
              <h3 className="font-semibold">Text Post</h3>
              <p className="text-sm text-gray-600">Quick updates and thoughts</p>
            </button>

            <button
              onClick={() => setContentType('ARTICLE')}
              className={`p-6 rounded-lg border-2 transition-all ${
                contentType === 'ARTICLE'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileText className="w-8 h-8 mb-2 mx-auto text-indigo-600" />
              <h3 className="font-semibold">Article</h3>
              <p className="text-sm text-gray-600">Long-form content with rich formatting</p>
            </button>

            <button
              onClick={() => setContentType('VIDEO')}
              className={`p-6 rounded-lg border-2 transition-all ${
                contentType === 'VIDEO'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileVideo className="w-8 h-8 mb-2 mx-auto text-indigo-600" />
              <h3 className="font-semibold">Video</h3>
              <p className="text-sm text-gray-600">Upload videos up to 2GB</p>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Common Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title {contentType !== 'TEXT' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a compelling title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required={contentType !== 'TEXT'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a category</option>
                  <option value="Technology">Technology</option>
                  <option value="Business">Business</option>
                  <option value="Education">Education</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <Button type="button" onClick={handleAddTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-indigo-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description (for SEO)
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Brief description for search engines..."
                  rows={2}
                  maxLength={160}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <p className="text-sm text-gray-500 mt-1">{metaDescription.length}/160 characters</p>
              </div>
            </CardContent>
          </Card>

          {/* Content Type-Specific Fields */}
          {contentType === 'TEXT' && (
            <Card>
              <CardHeader>
                <CardTitle>Your Message</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={8}
                  required
                  maxLength={1000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <p className="text-sm text-gray-500 mt-2">{content.length}/1000 characters</p>
              </CardContent>
            </Card>
          )}

          {contentType === 'ARTICLE' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Featured Image (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  {!featuredImagePreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <label className="cursor-pointer">
                        <span className="text-indigo-600 hover:text-indigo-700 font-medium">
                          Upload featured image
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFeaturedImageSelect}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={featuredImagePreview}
                        alt="Featured"
                        className="w-full max-h-64 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFeaturedImage(null)
                          setFeaturedImagePreview(null)
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Article Content</CardTitle>
                  <CardDescription>
                    Use the rich text editor to format your article
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RichTextEditor
                    onChange={(json, plainText) => {
                      setArticleContent(json)
                      setArticlePlainText(plainText)
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-4">
                    Word count: {articlePlainText.split(/\s+/).filter(Boolean).length} •
                    Estimated reading time: {Math.ceil(articlePlainText.split(/\s+/).filter(Boolean).length / 200)} min
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          {contentType === 'VIDEO' && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Video</CardTitle>
                <CardDescription>
                  Supported formats: MP4, MOV, AVI, WebM (max 2GB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!videoPreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <FileVideo className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <label className="cursor-pointer">
                      <span className="text-indigo-600 hover:text-indigo-700 font-medium text-lg">
                        Select video file
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="video/*"
                        onChange={handleVideoSelect}
                      />
                    </label>
                    <p className="text-gray-500 mt-2">or drag and drop</p>
                  </div>
                ) : (
                  <div>
                    <div className="relative mb-4">
                      <video
                        src={videoPreview}
                        controls
                        className="w-full max-h-96 rounded-lg bg-black"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setVideoFile(null)
                          setVideoPreview(null)
                          setVideoMetadata(null)
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm"><strong>File:</strong> {videoFile?.name}</p>
                      <p className="text-sm"><strong>Size:</strong> {((videoFile?.size || 0) / 1024 / 1024).toFixed(2)} MB</p>
                      {isUploadingVideo && (
                        <div className="mt-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full transition-all"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <p className="text-sm text-center mt-2">Uploading... {uploadProgress}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDraft(true)}
              disabled={isLoading || isUploadingVideo}
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isUploadingVideo}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? 'Publishing...' : isUploadingVideo ? 'Uploading...' : 'Publish'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
