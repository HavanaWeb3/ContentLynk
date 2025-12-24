/**
 * Rate Limiting for Image Uploads
 */

import { prisma } from '@/lib/db';

const MAX_UPLOADS_PER_HOUR = Number(process.env.MAX_IMAGE_UPLOADS_PER_HOUR) || 5;

export async function checkImageUploadRateLimit(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetIn?: number; // seconds until reset
}> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  try {
    // Count uploads in the last hour
    const recentUploads = await prisma.imageUploadRateLimit.count({
      where: {
        userId,
        uploadedAt: {
          gte: oneHourAgo,
        },
      },
    });

    const allowed = recentUploads < MAX_UPLOADS_PER_HOUR;
    const remaining = Math.max(0, MAX_UPLOADS_PER_HOUR - recentUploads);

    if (!allowed) {
      // Find oldest upload to calculate reset time
      const oldestUpload = await prisma.imageUploadRateLimit.findFirst({
        where: {
          userId,
          uploadedAt: {
            gte: oneHourAgo,
          },
        },
        orderBy: {
          uploadedAt: 'asc',
        },
      });

      if (oldestUpload) {
        const resetTime = new Date(oldestUpload.uploadedAt.getTime() + 60 * 60 * 1000);
        const resetIn = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
        return { allowed: false, remaining: 0, resetIn };
      }
    }

    return { allowed, remaining };
  } catch (error) {
    console.error('[Rate Limiting] Error:', error);
    // In case of error, deny upload to be safe
    return { allowed: false, remaining: 0 };
  }
}

export async function recordImageUpload(userId: string): Promise<void> {
  try {
    await prisma.imageUploadRateLimit.create({
      data: {
        userId,
      },
    });

    // Clean up old rate limit records (older than 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await prisma.imageUploadRateLimit.deleteMany({
      where: {
        uploadedAt: {
          lt: oneDayAgo,
        },
      },
    });
  } catch (error) {
    console.error('[Rate Limiting] Failed to record upload:', error);
  }
}
