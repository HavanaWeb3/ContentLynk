'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoWatchOptions {
  postId: string;
  videoDuration: number; // Total duration in seconds
  onWatchChange?: (percentage: number) => void;
  debounceMs?: number;
}

/**
 * Hook to track video watch percentage
 * Returns the current watch percentage and max watch percentage (0-1)
 */
export function useVideoWatch({
  postId,
  videoDuration,
  onWatchChange,
  debounceMs = 1000,
}: VideoWatchOptions) {
  const [currentTime, setCurrentTime] = useState(0);
  const [watchPercentage, setWatchPercentage] = useState(0);
  const [maxWatchPercentage, setMaxWatchPercentage] = useState(0);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number>(Date.now());
  const lastReportedPercentage = useRef<number>(0);
  const watchedSegments = useRef<Set<number>>(new Set()); // Track 10-second segments watched

  useEffect(() => {
    startTime.current = Date.now();
  }, [postId]);

  /**
   * Call this function from your video player's onProgress callback
   */
  const updateProgress = (played: number, playedSeconds: number) => {
    setCurrentTime(playedSeconds);

    // Calculate watch percentage
    const percentage = videoDuration > 0 ? played : 0;
    const clampedPercentage = Math.min(Math.max(percentage, 0), 1);

    setWatchPercentage(clampedPercentage);

    // Track maximum watch percentage
    if (clampedPercentage > maxWatchPercentage) {
      setMaxWatchPercentage(clampedPercentage);
    }

    // Track watched segments (for better accuracy on skipping)
    const segment = Math.floor(playedSeconds / 10); // 10-second segments
    watchedSegments.current.add(segment);

    // Debounced callback
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (onWatchChange && clampedPercentage !== lastReportedPercentage.current) {
        onWatchChange(clampedPercentage);
        lastReportedPercentage.current = clampedPercentage;
      }
    }, debounceMs);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    currentTime,
    watchPercentage,
    maxWatchPercentage,
    timeSpent: Math.floor((Date.now() - startTime.current) / 1000),
    isCompleted: maxWatchPercentage >= 0.8, // 80% or more = completed
    updateProgress, // Expose this to connect to video player
  };
}
