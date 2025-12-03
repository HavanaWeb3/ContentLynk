/**
 * Video Processing Utilities
 *
 * Handles video metadata extraction, thumbnail generation, and clip creation.
 * Uses fluent-ffmpeg for video processing tasks.
 *
 * Note: FFmpeg must be installed on the server for this to work.
 * For local development: brew install ffmpeg (Mac) or apt-get install ffmpeg (Linux)
 * For production (Vercel): FFmpeg is available in the build environment
 */

import ffmpeg from 'fluent-ffmpeg'
import { promisify } from 'util'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'
import os from 'os'

export interface VideoMetadata {
  duration: number // in seconds
  width: number
  height: number
  fps: number
  bitrate: number
  codec: string
  size: number // file size in bytes
}

/**
 * Extracts metadata from a video file
 */
export async function getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to extract video metadata: ${err.message}`))
        return
      }

      const videoStream = metadata.streams.find(s => s.codec_type === 'video')
      if (!videoStream) {
        reject(new Error('No video stream found'))
        return
      }

      resolve({
        duration: metadata.format.duration || 0,
        width: videoStream.width || 0,
        height: videoStream.height || 0,
        fps: videoStream.r_frame_rate
          ? videoStream.r_frame_rate.includes('/')
            ? Number(videoStream.r_frame_rate.split('/')[0]) / Number(videoStream.r_frame_rate.split('/')[1])
            : Number(videoStream.r_frame_rate)
          : 0,
        bitrate: metadata.format.bit_rate ? Number(metadata.format.bit_rate) : 0,
        codec: videoStream.codec_name || 'unknown',
        size: metadata.format.size || 0,
      })
    })
  })
}

/**
 * Generates a thumbnail from a video at a specific timestamp
 * @param videoPath - Path to the video file
 * @param timestamp - Timestamp in seconds (default: middle of video)
 * @param outputPath - Optional output path for the thumbnail
 * @returns Buffer containing the thumbnail image
 */
export async function generateVideoThumbnail(
  videoPath: string,
  timestamp?: number,
  outputPath?: string
): Promise<Buffer> {
  // If no timestamp provided, use middle of video
  if (timestamp === undefined) {
    const metadata = await getVideoMetadata(videoPath)
    timestamp = metadata.duration / 2
  }

  const tempOutput = outputPath || path.join(os.tmpdir(), `thumbnail-${Date.now()}.jpg`)

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: [timestamp],
        filename: path.basename(tempOutput),
        folder: path.dirname(tempOutput),
        size: '1280x720',
      })
      .on('end', async () => {
        try {
          const fs = await import('fs/promises')
          const buffer = await fs.readFile(tempOutput)
          // Clean up temp file if we created it
          if (!outputPath) {
            await fs.unlink(tempOutput).catch(() => {})
          }
          resolve(buffer)
        } catch (error) {
          reject(error)
        }
      })
      .on('error', (err) => {
        reject(new Error(`Failed to generate thumbnail: ${err.message}`))
      })
  })
}

/**
 * Creates a video clip from a larger video
 * @param videoPath - Path to the source video
 * @param startTime - Start time in seconds
 * @param duration - Duration of the clip in seconds
 * @param outputPath - Path for the output clip
 * @param aspectRatio - Target aspect ratio (e.g., '9:16' for TikTok)
 * @returns Path to the generated clip
 */
export async function createVideoClip(
  videoPath: string,
  startTime: number,
  duration: number,
  outputPath: string,
  aspectRatio: '9:16' | '16:9' | '1:1' = '9:16'
): Promise<string> {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(videoPath)
      .setStartTime(startTime)
      .setDuration(duration)

    // Apply aspect ratio cropping
    if (aspectRatio === '9:16') {
      // TikTok/Instagram Reels format (1080x1920)
      command = command
        .size('1080x1920')
        .aspect('9:16')
        .videoFilter('crop=ih*9/16:ih') // Crop to 9:16
    } else if (aspectRatio === '1:1') {
      // Instagram Square format (1080x1080)
      command = command
        .size('1080x1080')
        .aspect('1:1')
        .videoFilter('crop=min(iw\\,ih):min(iw\\,ih)')
    }

    command
      .output(outputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .format('mp4')
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(new Error(`Failed to create clip: ${err.message}`)))
      .on('progress', (progress) => {
        console.log(`Processing clip: ${Math.round(progress.percent || 0)}% done`)
      })
      .run()
  })
}

/**
 * Converts video to web-optimized format
 * Useful for ensuring consistent playback across browsers
 */
export async function optimizeVideoForWeb(
  inputPath: string,
  outputPath: string,
  maxWidth: number = 1920
): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .format('mp4')
      .size(`${maxWidth}x?`)
      .videoBitrate('2000k')
      .audioBitrate('128k')
      .outputOptions([
        '-preset fast',
        '-movflags +faststart', // Enable streaming
        '-pix_fmt yuv420p', // Better compatibility
      ])
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(new Error(`Failed to optimize video: ${err.message}`)))
      .on('progress', (progress) => {
        console.log(`Optimizing video: ${Math.round(progress.percent || 0)}% done`)
      })
      .run()
  })
}

/**
 * Checks if FFmpeg is available on the system
 */
export async function checkFFmpegAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    ffmpeg.getAvailableFormats((err) => {
      resolve(!err)
    })
  })
}

/**
 * Formats duration in seconds to HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * Estimates file size for a video clip
 */
export function estimateClipSize(duration: number, bitrate: number): number {
  // bitrate is in bits per second, we want bytes
  return Math.ceil((duration * bitrate) / 8)
}
