'use client';

import { VideoPlayer } from '@/components/content/VideoPlayer';
import { useVideoWatchTracker } from './VideoWatchTracker';

interface VideoPlayerWithTrackingProps {
  postId: string;
  videoDuration: number;
  url: string;
  thumbnail?: string;
  title?: string;
  autoPlay?: boolean;
  className?: string;
}

/**
 * VideoPlayer wrapper that adds watch time tracking
 * Drop-in replacement for VideoPlayer that automatically tracks watch percentage
 */
export function VideoPlayerWithTracking({
  postId,
  videoDuration,
  url,
  thumbnail,
  title,
  autoPlay = false,
  className = '',
}: VideoPlayerWithTrackingProps) {
  const { updateProgress } = useVideoWatchTracker(postId, videoDuration);

  const handleProgress = (progress: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
  }) => {
    // Update our tracking hook
    updateProgress(progress.played, progress.playedSeconds);
  };

  return (
    <VideoPlayer
      url={url}
      thumbnail={thumbnail}
      title={title}
      autoPlay={autoPlay}
      onProgress={handleProgress}
      className={className}
    />
  );
}
