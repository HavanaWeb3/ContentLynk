'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollDepthOptions {
  postId: string;
  contentType: 'ARTICLE' | 'TEXT';
  onDepthChange?: (depth: number) => void;
  debounceMs?: number;
}

/**
 * Hook to track scroll depth for articles and text posts
 * Returns the current scroll depth as a percentage (0-1)
 */
export function useScrollDepth({
  postId,
  contentType,
  onDepthChange,
  debounceMs = 500,
}: ScrollDepthOptions) {
  const [scrollDepth, setScrollDepth] = useState(0);
  const [maxScrollDepth, setMaxScrollDepth] = useState(0);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number>(Date.now());
  const lastReportedDepth = useRef<number>(0);

  useEffect(() => {
    startTime.current = Date.now();

    const calculateScrollDepth = () => {
      // Get the article/content container
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Calculate how far down the page we've scrolled (0-1)
      const scrollableDistance = documentHeight - windowHeight;
      const depth = scrollableDistance > 0 ? scrollTop / scrollableDistance : 0;
      const clampedDepth = Math.min(Math.max(depth, 0), 1);

      setScrollDepth(clampedDepth);

      // Track maximum scroll depth reached
      if (clampedDepth > maxScrollDepth) {
        setMaxScrollDepth(clampedDepth);
      }

      // Debounced callback
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        if (onDepthChange && clampedDepth !== lastReportedDepth.current) {
          onDepthChange(clampedDepth);
          lastReportedDepth.current = clampedDepth;
        }
      }, debounceMs);
    };

    // Initial calculation
    calculateScrollDepth();

    // Listen for scroll events
    window.addEventListener('scroll', calculateScrollDepth, { passive: true });
    window.addEventListener('resize', calculateScrollDepth, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', calculateScrollDepth);
      window.removeEventListener('resize', calculateScrollDepth);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [postId, contentType, onDepthChange, debounceMs, maxScrollDepth]);

  // Return current depth, max depth, and time spent
  return {
    scrollDepth,
    maxScrollDepth,
    timeSpent: Math.floor((Date.now() - startTime.current) / 1000),
    isCompleted: maxScrollDepth >= 0.8, // 80% or more = completed
  };
}
