import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPresignedUploadUrl, generateVideoKey } from '@/lib/aws-s3'

/**
 * Presigned URL API
 *
 * Returns a presigned S3 URL for direct client-side upload
 * This bypasses Vercel's 4.5MB body size limit
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

    const { filename, contentType, fileSize } = await request.json()

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields: filename, contentType' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-ms-wmv',
      'video/webm',
    ]
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only video files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (2GB limit)
    const maxSize = 2 * 1024 * 1024 * 1024 // 2GB
    if (fileSize && fileSize > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 2GB.' },
        { status: 400 }
      )
    }

    // Generate S3 key
    const videoKey = generateVideoKey(session.user.id, filename)

    // Get presigned URL (valid for 1 hour)
    const { uploadUrl, key } = await getPresignedUploadUrl(
      videoKey,
      contentType,
      3600 // 1 hour expiry
    )

    console.log('🔗 Presigned URL generated for:', filename)
    console.log('- Key:', key)
    console.log('- Size:', fileSize ? `${(fileSize / 1024 / 1024).toFixed(2)} MB` : 'unknown')

    return NextResponse.json({
      uploadUrl,
      key,
      expiresIn: 3600,
    })
  } catch (error) {
    console.error('Presigned URL generation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate upload URL',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
