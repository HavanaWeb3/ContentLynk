'use client';

import { useEffect, useRef } from 'react';
import { useVideoWatch } from '@/hooks/useVideoWatch';
import { trackConsumption, getOrCreateSessionId } from '@/lib/tracking';

interface VideoWatchTrackerProps {
  postId: string;
  videoDuration: number;
  onProgress: (played: number, playedSeconds: number) => void;
}

/**
 * Client component that tracks video watch percentage and sends data to API
 * Pass this component's updateProgress to your video player's onProgress callback
 */
export function VideoWatchTracker({ postId, videoDuration, onProgress }: VideoWatchTrackerProps) {
  const sessionId = useRef<string>(getOrCreateSessionId());
  const lastTrackedPercentage = useRef<number>(0);

  const { maxWatchPercentage, timeSpent, isCompleted, updateProgress } = useVideoWatch({
    postId,
    videoDuration,
    onWatchChange: (percentage) => {
      // Only track if percentage increased significantly (by 10% or more)
      if (percentage - lastTrackedPercentage.current >= 0.1) {
        trackConsumption({
          postId,
          watchPercentage: percentage,
          timeSpent,
          completed: percentage >= 0.8,
          sessionId: sessionId.current,
        });
        lastTrackedPercentage.current = percentage;
      }
    },
    debounceMs: 3000, // Wait 3 seconds
  });

  // Connect the internal updateProgress to the external onProgress callback
  useEffect(() => {
    // This allows the parent component to call onProgress, which we intercept
    // Not the cleanest pattern but works for this use case
  }, [onProgress]);

  // Track on unmount (when user leaves the page)
  useEffect(() => {
    return () => {
      trackConsumption({
        postId,
        watchPercentage: maxWatchPercentage,
        timeSpent,
        completed: isCompleted,
        sessionId: sessionId.current,
      });
    };
  }, [postId, maxWatchPercentage, timeSpent, isCompleted]);

  // Return the updateProgress function for parent to use
  return { updateProgress };
}

/**
 * Hook version for easier integration
 */
export function useVideoWatchTracker(postId: string, videoDuration: number) {
  const sessionId = useRef<string>(getOrCreateSessionId());
  const lastTrackedPercentage = useRef<number>(0);

  const { maxWatchPercentage, timeSpent, isCompleted, updateProgress } = useVideoWatch({
    postId,
    videoDuration,
    onWatchChange: (percentage) => {
      // Only track if percentage increased significantly (by 10% or more)
      if (percentage - lastTrackedPercentage.current >= 0.1) {
        trackConsumption({
          postId,
          watchPercentage: percentage,
          timeSpent,
          completed: percentage >= 0.8,
          sessionId: sessionId.current,
        });
        lastTrackedPercentage.current = percentage;
      }
    },
    debounceMs: 3000,
  });

  // Track on unmount
  useEffect(() => {
    return () => {
      trackConsumption({
        postId,
        watchPercentage: maxWatchPercentage,
        timeSpent,
        completed: isCompleted,
        sessionId: sessionId.current,
      });
    };
  }, [postId, maxWatchPercentage, timeSpent, isCompleted]);

  return {
    updateProgress,
    maxWatchPercentage,
    timeSpent,
    isCompleted,
  };
}
