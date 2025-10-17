import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { put } from '@vercel/blob'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

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
    const filename = `${timestamp}-${randomId}.${extension}`

    try {
      // For development, save to public/uploads directory
      // In production with real Vercel Blob token, upload to Vercel Blob Storage
      if (process.env.BLOB_READ_WRITE_TOKEN === 'demo-token-replace-with-real-vercel-blob-token') {
        // Development mode - save file to public/uploads directory
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create uploads directory structure
        const uploadsDir = join(process.cwd(), 'public', 'uploads', session.user.id)
        await mkdir(uploadsDir, { recursive: true })

        // Save file
        const filePath = join(uploadsDir, filename)
        await writeFile(filePath, buffer)

        // Return URL that can be accessed by the browser
        const publicUrl = `/uploads/${session.user.id}/${filename}`

        console.log('🖼️ Image upload debug:')
        console.log('- File name:', file.name)
        console.log('- File size:', file.size)
        console.log('- File type:', file.type)
        console.log('- Saved to:', filePath)
        console.log('- Public URL:', publicUrl)

        return NextResponse.json({
          url: publicUrl,
          filename: file.name
        })
      }

      // Production mode - upload to Vercel Blob
      const blobFilename = `posts/${session.user.id}/${filename}`
      const blob = await put(blobFilename, file, {
        access: 'public',
      })

      return NextResponse.json({
        url: blob.url,
        filename: file.name
      })
    } catch (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload image' },
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