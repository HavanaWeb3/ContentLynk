import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Generate a unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop() || 'jpg'
    const blobFilename = `posts/${session.user.id}/${timestamp}-${randomId}.${extension}`

    try {
      // Upload to Vercel Blob Storage
      // Note: Vercel automatically provides BLOB_READ_WRITE_TOKEN when blob store is linked
      const blob = await put(blobFilename, file, {
        access: 'public',
      })

      console.log('🖼️ Image upload success:')
      console.log('- File name:', file.name)
      console.log('- File size:', file.size)
      console.log('- File type:', file.type)
      console.log('- Blob URL:', blob.url)

      return NextResponse.json({
        url: blob.url,
        filename: file.name
      })
    } catch (uploadError) {
      console.error('Upload error:', uploadError)
      console.error('Blob token present:', !!process.env.BLOB_READ_WRITE_TOKEN)

      return NextResponse.json(
        {
          error: 'Failed to upload image. Please ensure Vercel Blob storage is configured.',
          details: uploadError instanceof Error ? uploadError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}