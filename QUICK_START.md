# Quick Start Guide - Anti-Gaming System

## 🚀 Get Started in 5 Minutes

### Step 1: Make Yourself an Admin (1 min)

```sql
-- Option A: Using the database URL directly
psql "postgres://dfe1f22114c37964c3bf08f829ee8555d874502c6d7d9322373cf1933c48ddd6:sk_mBkqwRWtcF7YE6xM5YO90@db.prisma.io:5432/postgres?sslmode=require" \
  -c "UPDATE users SET \"isAdmin\" = true WHERE email = 'your@email.com';"

-- Option B: Using Prisma Studio
npx prisma studio
# Then edit your user and set isAdmin = true
```

### Step 2: Access the Dashboard (30 sec)

Visit: https://contentlynk.vercel.app/admin/flagged

You should see the moderator dashboard with any flagged posts.

### Step 3: Update Your Frontend (3 min)

Find your existing like/comment/share handlers and update them:

**Before:**
```typescript
// Old way - direct database
const handleLike = async () => {
  await prisma.like.create({ postId, userId });
};
```

**After:**
```typescript
// New way - protected API
const handleLike = async () => {
  const res = await fetch(`/api/posts/${postId}/like`, {
    method: 'POST'
  });

  if (res.status === 429) {
    alert('Please slow down! You\'re engaging too quickly.');
    return;
  }

  if (!res.ok) {
    const data = await res.json();
    alert(data.error);
    return;
  }

  // Update UI
  setLiked(true);
  setLikesCount(prev => prev + 1);
};
```

### Step 4: Test It Out (30 sec)

Try these actions on your site:
1. ✅ Like a post → Should work
2. ✅ Like 21 posts rapidly → Should get rate limited
3. ✅ Try to like your own post → Should be blocked
4. ✅ Like the same post twice → Should be prevented

### Step 5: Monitor Activity (30 sec)

Check the database:
```sql
-- See recent engagements
SELECT * FROM engagements ORDER BY created_at DESC LIMIT 10;

-- Check if any posts flagged
SELECT COUNT(*) FROM flagged_posts WHERE status = 'PENDING';

-- View trust scores
SELECT username, trust_score FROM users ORDER BY trust_score DESC LIMIT 10;
```

---

## 📱 Frontend Component Examples

### Like Button Component

```typescript
'use client';

import { useState } from 'react';

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({ postId, initialLiked, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: liked ? 'DELETE' : 'POST'
      });

      const data = await res.json();

      if (res.status === 429) {
        alert('⏳ You\'re engaging too quickly! Please wait a few minutes and try again.');
        return;
      }

      if (res.status === 400 && data.error?.includes('own posts')) {
        alert('❌ You cannot like your own posts.');
        return;
      }

      if (!res.ok) {
        alert(data.error || 'Failed to like post');
        return;
      }

      // Update UI
      setLiked(!liked);
      setCount(prev => liked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Failed to like post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
        liked
          ? 'bg-red-500 text-white'
          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
      } disabled:opacity-50`}
    >
      {liked ? '❤️' : '🤍'} {count}
    </button>
  );
}
```

### Comment Form Component

```typescript
'use client';

import { useState } from 'react';

interface CommentFormProps {
  postId: string;
  onCommentAdded: (comment: any) => void;
}

export function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      const data = await res.json();

      if (res.status === 429) {
        alert('⏳ You\'re commenting too quickly! Please slow down.');
        return;
      }

      if (res.status === 400 && data.error?.includes('own posts')) {
        alert('❌ You cannot comment on your own posts.');
        return;
      }

      if (!res.ok) {
        alert(data.error || 'Failed to post comment');
        return;
      }

      // Success - add comment to UI
      onCommentAdded(data.comment);
      setContent('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        disabled={loading}
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '...' : 'Post'}
      </button>
    </form>
  );
}
```

### Share Button Component

```typescript
'use client';

import { useState } from 'react';

interface ShareButtonProps {
  postId: string;
  post: {
    title?: string;
    content: string;
  };
}

export function ShareButton({ postId, post }: ShareButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (loading) return;

    setLoading(true);
    try {
      // Track share in database
      const res = await fetch(`/api/posts/${postId}/share`, {
        method: 'POST'
      });

      const data = await res.json();

      if (res.status === 429) {
        alert('⏳ You\'re sharing too quickly! Please slow down.');
        return;
      }

      if (res.status === 400 && data.error?.includes('own posts')) {
        alert('❌ You cannot share your own posts.');
        return;
      }

      if (!res.ok) {
        alert(data.error || 'Failed to share post');
        return;
      }

      // Native share dialog
      if (navigator.share) {
        await navigator.share({
          title: post.title || 'Check out this post',
          text: post.content.substring(0, 100) + '...',
          url: window.location.href
        });
      } else {
        // Fallback: copy link
        await navigator.clipboard.writeText(window.location.href);
        alert('✅ Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition disabled:opacity-50"
    >
      🔗 Share
    </button>
  );
}
```

### Rate Limit Toast

```typescript
// components/RateLimitToast.tsx
'use client';

import { useEffect, useState } from 'react';

export function RateLimitToast() {
  const [visible, setVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    // Listen for rate limit events
    const handleRateLimit = () => {
      setVisible(true);
      setTimeRemaining(300); // 5 minutes in seconds

      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setVisible(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    };

    window.addEventListener('rateLimit', handleRateLimit);
    return () => window.removeEventListener('rateLimit', handleRateLimit);
  }, []);

  if (!visible) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-6 py-4 rounded-lg shadow-lg">
      <p className="font-bold">⏳ Rate Limit Active</p>
      <p className="text-sm">
        Please wait {minutes}:{seconds.toString().padStart(2, '0')} before engaging again
      </p>
    </div>
  );
}

// In your engagement handlers, dispatch the event:
if (res.status === 429) {
  window.dispatchEvent(new Event('rateLimit'));
}
```

---

## 🔍 Debugging Tools

### Check Quality Score

```typescript
// pages/api/debug/quality/[postId].ts
import { NextRequest, NextResponse } from 'next/server';
import { calculateQualityScore, calculateDiversityScore } from '@/lib/anti-gaming';

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  const quality = await calculateQualityScore(params.postId);
  const diversity = await calculateDiversityScore(params.postId);

  return NextResponse.json({
    postId: params.postId,
    quality,
    diversity,
    status: quality < 30 ? 'WOULD BE HELD' : 'WOULD BE RELEASED',
    reason: quality < 30 ? 'Low quality score' : diversity < 0.3 ? 'Low diversity' : 'OK'
  });
}
```

Visit: https://contentlynk.vercel.app/api/debug/quality/POST_ID

### SQL Helper Queries

```sql
-- Check your own engagements in last 5 minutes
SELECT
  engagement_type,
  COUNT(*) as count,
  MAX(created_at) as last_engagement
FROM engagements
WHERE creator_id = 'YOUR_USER_ID'
AND created_at >= NOW() - INTERVAL '5 minutes'
GROUP BY engagement_type;

-- Find posts with low diversity
SELECT
  p.id,
  p.content,
  calculate_diversity_score(p.id) as diversity,
  calculate_quality_score(p.id) as quality
FROM posts p
WHERE calculate_diversity_score(p.id) < 0.5
ORDER BY calculate_diversity_score(p.id) ASC
LIMIT 10;

-- Check if you hit daily cap
SELECT has_hit_daily_cap('YOUR_USER_ID');

-- See your remaining capacity
SELECT get_daily_earnings_remaining('YOUR_USER_ID');
```

---

## 📊 Admin Dashboard Enhancements

### Add Stats Card

```typescript
// components/FlaggedStats.tsx
'use client';

export function FlaggedStats({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <p className="text-gray-600 dark:text-gray-400 text-sm">Pending Review</p>
        <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <p className="text-gray-600 dark:text-gray-400 text-sm">Confirmed Gaming</p>
        <p className="text-3xl font-bold text-red-600">{stats.confirmed}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <p className="text-gray-600 dark:text-gray-400 text-sm">False Positives</p>
        <p className="text-3xl font-bold text-green-600">{stats.cleared}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <p className="text-gray-600 dark:text-gray-400 text-sm">Accuracy</p>
        <p className="text-3xl font-bold text-blue-600">
          {((stats.confirmed / (stats.confirmed + stats.cleared)) * 100).toFixed(1)}%
        </p>
      </div>
    </div>
  );
}
```

---

## ✅ Testing Checklist

### Basic Functionality
- [ ] Like a post (should work)
- [ ] Unlike a post (should work)
- [ ] Comment on a post (should work)
- [ ] Share a post (should work)

### Rate Limiting
- [ ] Like 21 posts rapidly (should get 429 on 21st)
- [ ] Wait 5 minutes and try again (should work)
- [ ] Check console for rate limit messages

### Self-Engagement Prevention
- [ ] Try to like your own post (should be blocked)
- [ ] Try to comment on your own post (should be blocked)
- [ ] Try to share your own post (should be blocked)

### Duplicate Prevention
- [ ] Like a post twice (second should fail)
- [ ] Comment twice with same content (second should work)
- [ ] Share a post twice (second should fail)

### Admin Dashboard
- [ ] Access /admin/flagged as admin (should work)
- [ ] Access /admin/flagged as regular user (should get 403)
- [ ] Review a flagged post (should update trust score)
- [ ] Clear a false positive (should restore trust)

### Cron Job
- [ ] Manually trigger cron endpoint (should return flagged count)
- [ ] Check logs in 24 hours to verify auto-run

---

## 🎯 Success Metrics

After 1 week, check these:

### Engagement Health
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_engagements,
  COUNT(DISTINCT creator_id) as unique_users,
  ROUND(COUNT(*)::DECIMAL / COUNT(DISTINCT creator_id), 2) as avg_per_user
FROM engagements
WHERE created_at >= CURRENT_DATE - 7
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

**Healthy:** avg_per_user between 5-20
**Suspicious:** avg_per_user > 50

### Detection Performance
```sql
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*)::DECIMAL / SUM(COUNT(*)) OVER () * 100, 1) as percentage
FROM flagged_posts
GROUP BY status;
```

**Good:** < 5% false positive rate (CLEARED)
**Excellent:** > 90% confirmed (CONFIRMED)

### User Trust Distribution
```sql
SELECT
  CASE
    WHEN trust_score >= 500 THEN 'Highly Trusted'
    WHEN trust_score >= 100 THEN 'Trusted'
    WHEN trust_score >= 0 THEN 'Neutral'
    WHEN trust_score >= -200 THEN 'Suspicious'
    ELSE 'High Risk'
  END as trust_level,
  COUNT(*) as count
FROM users
GROUP BY trust_level
ORDER BY MIN(trust_score) DESC;
```

**Healthy:** 90%+ in Neutral or better

---

## 🚀 You're All Set!

Your anti-gaming system is live and protecting your platform. Check `DEPLOYMENT_COMPLETE.md` for full documentation.

**Need help?** All docs are in:
- `/Users/davidsime/hvna-ecosystem/contentlynk/ANTI_GAMING_INTEGRATION.md`
- `/Users/davidsime/contentlynk-migrations/ANTI_GAMING_GUIDE.md`
