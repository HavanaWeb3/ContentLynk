/**
 * NSFW Detection using AWS Rekognition
 */

import { RekognitionClient, DetectModerationLabelsCommand } from '@aws-sdk/client-rekognition';

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export interface ModerationResult {
  isAppropriate: boolean;
  labels: string[];
  confidence: number;
  rawLabels?: any[];
}

/**
 * Detect inappropriate content in an image
 * @param imageUrl - Public URL of the image to analyze
 * @returns Moderation result
 */
export async function detectInappropriateContent(imageUrl: string): Promise<ModerationResult> {
  try {
    // In development mode with placeholder credentials, skip actual detection
    if (process.env.AWS_ACCESS_KEY_ID === 'development-placeholder') {
      console.log('[NSFW Detection] Development mode - skipping actual detection');
      return {
        isAppropriate: true,
        labels: [],
        confidence: 0,
      };
    }

    // Download image from URL
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Call AWS Rekognition
    const command = new DetectModerationLabelsCommand({
      Image: {
        Bytes: imageBuffer,
      },
      MinConfidence: Number(process.env.NSFW_MODERATION_THRESHOLD) || 80,
    });

    const response = await rekognitionClient.send(command);
    const moderationLabels = response.ModerationLabels || [];

    // Categories that should be rejected
    const inappropriateCategories = [
      'Explicit Nudity',
      'Suggestive',
      'Violence',
      'Visually Disturbing',
      'Hate Symbols',
      'Drugs',
      'Tobacco',
      'Alcohol',
      'Gambling',
      'Rude Gestures',
    ];

    const flaggedLabels: string[] = [];
    let maxConfidence = 0;

    for (const label of moderationLabels) {
      if (label.Name && inappropriateCategories.includes(label.Name)) {
        flaggedLabels.push(label.Name);
        maxConfidence = Math.max(maxConfidence, label.Confidence || 0);
      }

      // Also check parent categories
      if (label.ParentName && inappropriateCategories.includes(label.ParentName)) {
        flaggedLabels.push(`${label.ParentName} - ${label.Name}`);
        maxConfidence = Math.max(maxConfidence, label.Confidence || 0);
      }
    }

    const isAppropriate = flaggedLabels.length === 0;

    console.log(`[NSFW Detection] Image ${isAppropriate ? 'APPROVED' : 'REJECTED'}:`, {
      flaggedLabels,
      confidence: maxConfidence,
    });

    return {
      isAppropriate,
      labels: flaggedLabels,
      confidence: maxConfidence,
      rawLabels: moderationLabels,
    };
  } catch (error) {
    console.error('[NSFW Detection] Error:', error);
    // In case of error, reject the image to be safe
    return {
      isAppropriate: false,
      labels: ['Error during moderation'],
      confidence: 0,
    };
  }
}

/**
 * Format moderation labels for user-friendly display
 */
export function formatModerationReason(labels: string[]): string {
  if (labels.length === 0) {
    return 'Unknown reason';
  }

  if (labels.length === 1) {
    return `Contains ${labels[0].toLowerCase()}`;
  }

  return `Contains ${labels.slice(0, 2).map(l => l.toLowerCase()).join(' and ')}`;
}
