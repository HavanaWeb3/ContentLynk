'use client';

import { ScrollDepthTracker } from './ScrollDepthTracker';

interface ArticleWithTrackingProps {
  postId: string;
  content: string;
  children?: React.ReactNode;
}

/**
 * Wrapper component that adds scroll depth tracking to article content
 * Use this in server components by wrapping the article content
 */
export function ArticleWithTracking({ postId, content, children }: ArticleWithTrackingProps) {
  return (
    <>
      <ScrollDepthTracker postId={postId} contentType="ARTICLE" />
      {children || (
        <div
          className="leading-relaxed text-gray-800"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </>
  );
}
