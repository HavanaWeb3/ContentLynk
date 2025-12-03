import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToS3, generateVideoKey } from '@/lib/aws-s3'
import { getVideoMetadata, generateVideoThumbnail } from '@/lib/video-processor'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'
import os from 'os'

// Configure route for large file uploads
export const runtime = 'nodejs' // Use Node.js runtime (not Edge) for file processing
export const maxDuration = 300 // 5 minutes max execution time

/**
 * Video Upload API
 *
 * Handles large video file uploads to AWS S3
 * Supports files up to 2GB
 * Generates thumbnails and extracts metadata
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if AWS is configured
    if (!process.env.AWS_S3_BUCKET || !process.env.AWS_ACCESS_KEY_ID) {
      return NextResponse.json(
        { error: 'AWS S3 is not configured. Please set up AWS credentials.' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type (video only)
    const allowedTypes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-ms-wmv',
      'video/webm',
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only video files are allowed (MP4, MOV, AVI, WMV, WebM).' },
        { status: 400 }
      )
    }

    // Validate file size (2GB limit)
    const maxSize = 2 * 1024 * 1024 * 1024 // 2GB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 2GB.' },
        { status: 400 }
      )
    }

    console.log('🎥 Video upload started:')
    console.log('- File name:', file.name)
    console.log('- File size:', (file.size / 1024 / 1024).toFixed(2), 'MB')
    console.log('- File type:', file.type)
    console.log('- User ID:', session.user.id)

    // Save file temporarily for processing
    const tempPath = path.join(os.tmpdir(), `upload-${Date.now()}-${file.name}`)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(tempPath, buffer)

    try {
      // Extract video metadata
      console.log('📊 Extracting video metadata...')
      const metadata = await getVideoMetadata(tempPath)
      console.log('- Duration:', Math.round(metadata.duration), 'seconds')
      console.log('- Resolution:', `${metadata.width}x${metadata.height}`)

      // Generate thumbnail
      console.log('📸 Generating thumbnail...')
      const thumbnailBuffer = await generateVideoThumbnail(tempPath)

      // Generate S3 keys
      const videoKey = generateVideoKey(session.user.id, file.name)
      const thumbnailKey = videoKey.replace(/\.[^.]+$/, '-thumb.jpg')

      // Upload video to S3
      console.log('☁️ Uploading video to S3...')
      const { url: videoUrl } = await uploadToS3(buffer, videoKey, file.type)

      // Upload thumbnail to S3
      console.log('☁️ Uploading thumbnail to S3...')
      const { url: thumbnailUrl } = await uploadToS3(
        thumbnailBuffer,
        thumbnailKey,
        'image/jpeg'
      )

      console.log('✅ Video upload complete!')
      console.log('- Video URL:', videoUrl)
      console.log('- Thumbnail URL:', thumbnailUrl)

      // Clean up temporary file
      await unlink(tempPath).catch(() => {})

      return NextResponse.json({
        success: true,
        video: {
          url: videoUrl,
          thumbnail: thumbnailUrl,
          duration: Math.round(metadata.duration),
          width: metadata.width,
          height: metadata.height,
          size: file.size,
          filename: file.name,
        },
      })
    } catch (processingError) {
      // Clean up temporary file on error
      await unlink(tempPath).catch(() => {})

      console.error('Video processing error:', processingError)

      // If processing fails, upload video anyway but without metadata
      const videoKey = generateVideoKey(session.user.id, file.name)
      const { url: videoUrl } = await uploadToS3(buffer, videoKey, file.type)

      return NextResponse.json({
        success: true,
        warning: 'Video uploaded but metadata extraction failed',
        video: {
          url: videoUrl,
          thumbnail: null,
          duration: null,
          width: null,
          height: null,
          size: file.size,
          filename: file.name,
        },
      })
    }
  } catch (error) {
    console.error('Video upload error:', error)
    return NextResponse.json(
      {
        error: 'Failed to upload video',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to check upload status
 * Can be used for polling during long uploads
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check AWS configuration
  const awsConfigured = !!(
    process.env.AWS_S3_BUCKET &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
  )

  return NextResponse.json({
    configured: awsConfigured,
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB
    allowedFormats: ['mp4', 'mov', 'avi', 'wmv', 'webm'],
  })
}
