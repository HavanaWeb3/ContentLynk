/**
 * AWS S3 Configuration and Utilities
 *
 * This module handles video/file uploads to AWS S3 with CloudFront CDN delivery.
 *
 * Required Environment Variables:
 * - AWS_REGION: Your AWS region (e.g., 'us-east-1')
 * - AWS_ACCESS_KEY_ID: Your AWS access key
 * - AWS_SECRET_ACCESS_KEY: Your AWS secret key
 * - AWS_S3_BUCKET: Your S3 bucket name for content storage
 * - AWS_CLOUDFRONT_URL: Your CloudFront distribution URL (optional)
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export const AWS_CONFIG = {
  bucket: process.env.AWS_S3_BUCKET || '',
  region: process.env.AWS_REGION || 'us-east-1',
  cloudFrontUrl: process.env.AWS_CLOUDFRONT_URL || '',
}

/**
 * Uploads a file to S3 with support for large files
 * Uses multipart upload for files larger than 5MB
 */
export async function uploadToS3(
  file: Buffer | Blob | File,
  key: string,
  contentType: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; key: string }> {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: AWS_CONFIG.bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
      // Make files publicly readable (you can adjust ACL as needed)
      // ACL: 'public-read', // Commented out - use bucket policy instead
    },
    queueSize: 4, // Number of concurrent parts
    partSize: 1024 * 1024 * 5, // 5MB parts
  })

  // Track progress
  upload.on('httpUploadProgress', (progress) => {
    if (onProgress && progress.loaded && progress.total) {
      const percentage = Math.round((progress.loaded / progress.total) * 100)
      onProgress(percentage)
    }
  })

  await upload.done()

  // Return the file URL
  const url = AWS_CONFIG.cloudFrontUrl
    ? `${AWS_CONFIG.cloudFrontUrl}/${key}`
    : `https://${AWS_CONFIG.bucket}.s3.${AWS_CONFIG.region}.amazonaws.com/${key}`

  return { url, key }
}

/**
 * Generates a presigned URL for direct browser uploads
 * Useful for client-side uploads to avoid server bandwidth
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: AWS_CONFIG.bucket,
    Key: key,
    ContentType: contentType,
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

/**
 * Deletes a file from S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: AWS_CONFIG.bucket,
    Key: key,
  })

  await s3Client.send(command)
}

/**
 * Checks if a file exists in S3
 */
export async function fileExistsInS3(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: AWS_CONFIG.bucket,
      Key: key,
    })
    await s3Client.send(command)
    return true
  } catch {
    return false
  }
}

/**
 * Generates a unique S3 key for a video file
 */
export function generateVideoKey(userId: string, filename: string): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(7)
  const extension = filename.split('.').pop() || 'mp4'
  return `videos/${userId}/${timestamp}-${randomId}.${extension}`
}

/**
 * Generates a unique S3 key for an image file
 */
export function generateImageKey(userId: string, filename: string, type: 'thumbnail' | 'featured' | 'content'): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(7)
  const extension = filename.split('.').pop() || 'jpg'
  return `images/${type}/${userId}/${timestamp}-${randomId}.${extension}`
}

/**
 * Generates a unique S3 key for a video clip
 */
export function generateClipKey(userId: string, parentVideoId: string, filename: string): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(7)
  const extension = filename.split('.').pop() || 'mp4'
  return `clips/${userId}/${parentVideoId}/${timestamp}-${randomId}.${extension}`
}

export { s3Client }
