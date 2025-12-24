import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/db';
import { processImage, validateImage, generateImageVariants } from '@/lib/image-processing';
import { detectInappropriateContent, formatModerationReason } from '@/lib/nsfw-detection';
import { checkImageUploadRateLimit, recordImageUpload } from '@/lib/rate-limiting';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check rate limit
    const rateLimit = await checkImageUploadRateLimit(session.user.id);
    if (!rateLimit.allowed) {
      const minutes = Math.ceil((rateLimit.resetIn || 0) / 60);
      return NextResponse.json(
        {
          error: `Upload limit reached. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
          rateLimitExceeded: true,
        },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (2MB limit for profile images)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 2MB.' },
        { status: 400 }
      );
    }

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate image
    const validation = await validateImage(buffer);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid image' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const baseFilename = `profile-images/${session.user.id}/${timestamp}-${randomId}`;

    // Process image and generate variants
    console.log('[Profile Image] Processing image variants...');
    const variants = await generateImageVariants(buffer);

    // Upload full-size image to Vercel Blob
    console.log('[Profile Image] Uploading full-size image...');
    const fullBlob = await put(`${baseFilename}-full.webp`, variants.full.buffer, {
      access: 'public',
      contentType: 'image/webp',
    });

    // Run NSFW detection on full-size image
    console.log('[Profile Image] Running NSFW detection...');
    const moderationResult = await detectInappropriateContent(fullBlob.url);

    if (!moderationResult.isAppropriate) {
      // Image rejected - in production, you'd want to delete the uploaded image
      console.log('[Profile Image] Image rejected by moderation');

      return NextResponse.json(
        {
          error: `Image rejected: ${formatModerationReason(moderationResult.labels)}. Please upload an appropriate profile image.`,
          moderationFailed: true,
        },
        { status: 400 }
      );
    }

    // Upload thumbnail
    console.log('[Profile Image] Uploading thumbnail...');
    const thumbnailBlob = await put(`${baseFilename}-thumb.webp`, variants.thumbnail.buffer, {
      access: 'public',
      contentType: 'image/webp',
    });

    // Record upload in database
    await prisma.profileImageUpload.create({
      data: {
        userId: session.user.id,
        imageUrl: fullBlob.url,
        thumbnailUrl: thumbnailBlob.url,
        moderationStatus: 'APPROVED',
        fileSize: variants.full.size,
        mimeType: 'image/webp',
      },
    });

    // Record rate limit
    await recordImageUpload(session.user.id);

    console.log('[Profile Image] Upload successful:', {
      fullUrl: fullBlob.url,
      thumbnailUrl: thumbnailBlob.url,
      size: variants.full.size,
    });

    return NextResponse.json({
      url: fullBlob.url,
      thumbnailUrl: thumbnailBlob.url,
      filename: file.name,
      size: variants.full.size,
    });
  } catch (error) {
    console.error('[Profile Image] Upload error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to upload profile image',
      },
      { status: 500 }
    );
  }
}
