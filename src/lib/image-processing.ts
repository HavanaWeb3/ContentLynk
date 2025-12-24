/**
 * Image Processing Utilities
 * Handles resizing, compression, and format conversion
 */

import sharp from 'sharp';

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  fit?: 'cover' | 'contain' | 'fill';
}

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

/**
 * Process an image: resize, compress, and convert format
 */
export async function processImage(
  inputBuffer: Buffer,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> {
  const {
    width = 800,
    height = 800,
    quality = 85,
    format = 'webp',
    fit = 'cover',
  } = options;

  try {
    let image = sharp(inputBuffer);

    // Resize image
    image = image.resize(width, height, {
      fit,
      withoutEnlargement: true,
    });

    // Convert format and compress
    switch (format) {
      case 'jpeg':
        image = image.jpeg({ quality, progressive: true });
        break;
      case 'png':
        image = image.png({ compressionLevel: 9 });
        break;
      case 'webp':
        image = image.webp({ quality });
        break;
    }

    const buffer = await image.toBuffer();
    const metadata = await sharp(buffer).metadata();

    return {
      buffer,
      width: metadata.width || width,
      height: metadata.height || height,
      format: metadata.format || format,
      size: buffer.length,
    };
  } catch (error) {
    console.error('[Image Processing] Error:', error);
    throw new Error('Failed to process image');
  }
}

/**
 * Generate multiple image sizes (thumbnail, medium, full)
 */
export async function generateImageVariants(inputBuffer: Buffer): Promise<{
  thumbnail: ProcessedImage;
  medium: ProcessedImage;
  full: ProcessedImage;
}> {
  const [thumbnail, medium, full] = await Promise.all([
    processImage(inputBuffer, { width: 100, height: 100, quality: 80 }),
    processImage(inputBuffer, { width: 400, height: 400, quality: 85 }),
    processImage(inputBuffer, { width: 800, height: 800, quality: 90 }),
  ]);

  return { thumbnail, medium, full };
}

/**
 * Validate image file
 */
export async function validateImage(buffer: Buffer): Promise<{
  isValid: boolean;
  error?: string;
  metadata?: sharp.Metadata;
}> {
  try {
    const metadata = await sharp(buffer).metadata();

    // Check if it's a valid image format
    const validFormats = ['jpeg', 'png', 'webp', 'gif'];
    if (!metadata.format || !validFormats.includes(metadata.format)) {
      return {
        isValid: false,
        error: `Invalid image format. Supported formats: ${validFormats.join(', ')}`,
      };
    }

    // Check dimensions
    if (!metadata.width || !metadata.height) {
      return {
        isValid: false,
        error: 'Unable to determine image dimensions',
      };
    }

    // Check minimum dimensions
    const minDimension = 100;
    if (metadata.width < minDimension || metadata.height < minDimension) {
      return {
        isValid: false,
        error: `Image too small. Minimum dimensions: ${minDimension}x${minDimension}px`,
      };
    }

    // Check maximum dimensions
    const maxDimension = 5000;
    if (metadata.width > maxDimension || metadata.height > maxDimension) {
      return {
        isValid: false,
        error: `Image too large. Maximum dimensions: ${maxDimension}x${maxDimension}px`,
      };
    }

    return {
      isValid: true,
      metadata,
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid or corrupted image file',
    };
  }
}
