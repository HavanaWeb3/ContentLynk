import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { uploadToS3 } from '@/lib/aws-s3'
import { getVideoMetadata, generateVideoThumbnail } from '@/lib/video-processor'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'
import os from 'os'
import { Readable } from 'stream'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

/**
 * Process uploaded video
 *
 * Called after client uploads video directly to S3
 * Extracts metadata and generates thumbnail
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { videoKey, filename } = await request.json()

    if (!videoKey) {
      return NextResponse.json({ error: 'Video key is required' }, { status: 400 })
    }

    console.log('🔄 Processing uploaded video:', videoKey)

    try {
      // Download video from S3 to temporary file
      const getCommand = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: videoKey,
      })

      const response = await s3Client.send(getCommand)
      const tempPath = path.join(os.tmpdir(), `process-${Date.now()}-${filename || 'video.mp4'}`)

      // Stream S3 object to file
      if (response.Body instanceof Readable) {
        const writeStream = require('fs').createWriteStream(tempPath)
        await new Promise((resolve, reject) => {
          response.Body.pipe(writeStream)
          writeStream.on('finish', resolve)
          writeStream.on('error', reject)
        })
      } else {
        throw new Error('Unable to read video from S3')
      }

      // Extract metadata
      console.log('📊 Extracting video metadata...')
      const metadata = await getVideoMetadata(tempPath)
      console.log('- Duration:', Math.round(metadata.duration), 'seconds')
      console.log('- Resolution:', `${metadata.width}x${metadata.height}`)

      // Generate thumbnail
      console.log('📸 Generating thumbnail...')
      const thumbnailBuffer = await generateVideoThumbnail(tempPath)

      // Upload thumbnail to S3
      const thumbnailKey = videoKey.replace(/\.[^.]+$/, '-thumb.jpg')
      console.log('☁️ Uploading thumbnail to S3...')
      const { url: thumbnailUrl } = await uploadToS3(
        thumbnailBuffer,
        thumbnailKey,
        'image/jpeg'
      )

      // Clean up temp file
      await unlink(tempPath).catch(() => {})

      const videoUrl = process.env.AWS_CLOUDFRONT_URL
        ? `${process.env.AWS_CLOUDFRONT_URL}/${videoKey}`
        : `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${videoKey}`

      console.log('✅ Video processing complete!')

      return NextResponse.json({
        success: true,
        video: {
          url: videoUrl,
          thumbnail: thumbnailUrl,
          duration: Math.round(metadata.duration),
          width: metadata.width,
          height: metadata.height,
          filename: filename || videoKey.split('/').pop(),
        },
      })
    } catch (processingError) {
      console.error('Video processing error:', processingError)

      // Return basic info without metadata if processing fails
      const videoUrl = process.env.AWS_CLOUDFRONT_URL
        ? `${process.env.AWS_CLOUDFRONT_URL}/${videoKey}`
        : `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${videoKey}`

      return NextResponse.json({
        success: true,
        warning: 'Video uploaded but metadata extraction failed',
        video: {
          url: videoUrl,
          thumbnail: null,
          duration: null,
          width: null,
          height: null,
          filename: filename || videoKey.split('/').pop(),
        },
      })
    }
  } catch (error) {
    console.error('Video processing error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process video',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
