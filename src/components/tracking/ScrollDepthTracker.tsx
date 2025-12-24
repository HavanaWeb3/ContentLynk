'use client';

import { useEffect, useRef } from 'react';
import { useScrollDepth } from '@/hooks/useScrollDepth';
import { trackConsumption, getOrCreateSessionId } from '@/lib/tracking';

interface ScrollDepthTrackerProps {
  postId: string;
  contentType: 'ARTICLE' | 'TEXT';
}

/**
 * Client component that tracks scroll depth and sends data to API
 * Drop this into any article or text post page
 */
export function ScrollDepthTracker({ postId, contentType }: ScrollDepthTrackerProps) {
  const sessionId = useRef<string>(getOrCreateSessionId());
  const lastTrackedDepth = useRef<number>(0);

  const { maxScrollDepth, timeSpent, isCompleted } = useScrollDepth({
    postId,
    contentType,
    onDepthChange: (depth) => {
      // Only track if depth increased significantly (by 10% or more)
      if (depth - lastTrackedDepth.current >= 0.1) {
        trackConsumption({
          postId,
          scrollDepth: depth,
          timeSpent,
          completed: depth >= 0.8,
          sessionId: sessionId.current,
        });
        lastTrackedDepth.current = depth;
      }
    },
    debounceMs: 2000, // Wait 2 seconds after scrolling stops
  });

  // Track on unmount (when user leaves the page)
  useEffect(() => {
    return () => {
      trackConsumption({
        postId,
        scrollDepth: maxScrollDepth,
        timeSpent,
        completed: isCompleted,
        sessionId: sessionId.current,
      });
    };
  }, [postId, maxScrollDepth, timeSpent, isCompleted]);

  // This component doesn't render anything
  return null;
}
