# BETA/NATURAL Mode System - Documentation

**Date:** October 12, 2025
**Project:** ContentLynk
**Status:** ✅ DEPLOYED

---

## Overview

ContentLynk now supports two operational modes:

1. **BETA Mode** - For initial launch and testing
   - Strict daily earning caps (10,000 tokens)
   - Immediate blocking on suspicious activity
   - Conservative rate limiting
   - Low tolerance for gaming attempts

2. **NATURAL Mode** - For post-launch steady state
   - No hard earning caps
   - Warning and probation system
   - Trust-based scoring
   - Creator-friendly approach

---

## Database Schema

### New Tables

#### 1. `creator_warnings`
Tracks all warnings issued to creators.

```sql
CREATE TABLE creator_warnings (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  action TEXT NOT NULL, -- WARNING | STRONG_WARNING | PROBATION | SUSPEND
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE | CLEARED | APPEALED
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  cleared_at TIMESTAMP WITH TIME ZONE,
  cleared_by TEXT,
  FOREIGN KEY (creator_id) REFERENCES users(id),
  FOREIGN KEY (cleared_by) REFERENCES users(id)
);
```

**Indexes:**
- `idx_creator_warnings_creator_created` - Query warnings by creator
- `idx_creator_warnings_status` - Filter by status
- `idx_creator_warnings_action` - Filter by action type

#### 2. `platform_config`
Stores platform-wide configuration.

```sql
CREATE TABLE platform_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_by TEXT,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

**Default Config Values:**

```json
{
  "mode": "BETA",
  "beta_config": {
    "daily_cap": 10000,
    "rate_limit_window": 5,
    "rate_limit_max": 20,
    "quality_threshold": 30,
    "diversity_threshold": 0.3
  },
  "natural_config": {
    "warning_thresholds": {
      "warning": {"velocity": 50, "quality": 20, "diversity": 0.2},
      "strong_warning": {"velocity": 75, "quality": 15, "diversity": 0.15},
      "probation": {"velocity": 100, "quality": 10, "diversity": 0.1}
    },
    "probation_duration_days": 7,
    "trust_score_penalties": {
      "warning": -50,
      "strong_warning": -100,
      "probation": -200,
      "suspend": -500
    }
  }
}
```

### Modified Tables

#### 3. `users` (new columns)

```sql
-- Added columns
trust_score INTEGER DEFAULT 100,           -- Range: -1000 to +1000
status TEXT DEFAULT 'ACTIVE',              -- ACTIVE | PROBATION | SUSPENDED
probation_until TIMESTAMP WITH TIME ZONE,  -- When probation ends
suspended_at TIMESTAMP WITH TIME ZONE      -- When user was suspended
```

**Indexes:**
- `idx_users_status` - Filter by user status
- `idx_users_probation_until` - Find users with active probation
- `idx_users_trust_score` - Sort by trust level

#### 4. `earnings` (new columns)

```sql
-- Added columns
held_until TIMESTAMP WITH TIME ZONE,  -- When earnings will be released
hold_reason TEXT                      -- Why earnings are held
```

**Indexes:**
- `idx_earnings_held_until` - Find held earnings

---

## Helper Functions

### 1. `get_platform_mode()`
Returns current platform mode.

```sql
SELECT get_platform_mode();  -- Returns: "BETA" or "NATURAL"
```

### 2. `is_user_in_probation(user_id TEXT)`
Checks if user is currently in probation or suspended.

```sql
SELECT is_user_in_probation('user_123');  -- Returns: true/false
```

### 3. `get_active_warnings_count(user_id TEXT)`
Counts active warnings for user in last 30 days.

```sql
SELECT get_active_warnings_count('user_123');  -- Returns: integer count
```

### 4. `issue_warning(creator_id, reason, details, action, message)`
Issues a warning to a creator and updates their status.

```sql
SELECT issue_warning(
  'user_123',
  'Suspicious velocity spike',
  '{"posts_per_hour": 50, "threshold": 20}'::jsonb,
  'WARNING',
  'You are engaging with content at an unusually high rate. Please slow down.'
);
-- Returns: warning_id
```

**Actions and their effects:**

| Action | Trust Score | Status Change | Duration |
|--------|-------------|---------------|----------|
| WARNING | -50 | None | N/A |
| STRONG_WARNING | -100 | None | N/A |
| PROBATION | -200 | PROBATION | 7 days |
| SUSPEND | -500 | SUSPENDED | Indefinite |

### 5. `clear_warning(warning_id, cleared_by)`
Clears a warning and partially restores trust score.

```sql
SELECT clear_warning('warning_456', 'admin_789');  -- Returns: boolean
```

**Trust restoration:**
- WARNING: +25
- STRONG_WARNING: +50
- PROBATION: +100 (also clears status)
- SUSPEND: +200 (also unsuspends)

### 6. `auto_clear_expired_probations()`
Automatically clears expired probations (call via cron).

```sql
SELECT auto_clear_expired_probations();  -- Returns: count of cleared users
```

---

## Admin Views

### 1. `active_warnings_summary`
Overview of users with active warnings.

```sql
SELECT * FROM active_warnings_summary;
```

**Columns:**
- user_id, username, email
- user_status
- probation_until
- trust_score
- warning_count
- strong_warning_count
- probation_count
- last_warning_at

### 2. `users_in_probation`
List of users currently in probation or suspended.

```sql
SELECT * FROM users_in_probation;
```

**Columns:**
- id, username, email
- status
- probation_until
- suspended_at
- trust_score
- probation_status (human-readable)

---

## Mode System Workflows

### BETA Mode Workflow

```
User Action
    ↓
Check Rate Limit (20/5min)
    ↓
Check Daily Cap (10,000 tokens)
    ↓
[FAIL] → Block & Error Message
[PASS] → Calculate Quality/Diversity
    ↓
[FAIL] → Hold Earnings, Flag for Review
[PASS] → Release Earnings Immediately
```

**Characteristics:**
- Hard stops prevent gaming
- Conservative thresholds
- Immediate consequences
- Manual review required for flagged content
- Good for testing detection accuracy

### NATURAL Mode Workflow

```
User Action
    ↓
Check User Status
    ↓
[SUSPENDED] → Block with Appeal Info
[PROBATION] → Hold Earnings Until Probation Ends
[ACTIVE] → Calculate Risk Score
    ↓
Risk Score Analysis
    ↓
[Low Risk] → Release Earnings
[Medium Risk] → Issue WARNING (-50 trust)
[High Risk] → Issue STRONG_WARNING (-100 trust)
[Very High Risk] → Issue PROBATION (-200 trust, 7 day hold)
[Extreme Risk] → SUSPEND (-500 trust, indefinite)
```

**Characteristics:**
- Progressive consequences
- Trust-based system
- Educational warnings
- Probation period allows correction
- Suspension is last resort

---

## API Integration Guide

### Check Current Mode

```typescript
// In your API route
import { prisma } from '@/lib/prisma';

async function getCurrentMode() {
  const config = await prisma.$queryRaw`SELECT get_platform_mode() as mode`;
  return config[0].mode.replace(/"/g, ''); // "BETA" or "NATURAL"
}
```

### Issue Warning (NATURAL Mode)

```typescript
async function issueWarningToCreator(
  userId: string,
  reason: string,
  detectionMetrics: object,
  action: 'WARNING' | 'STRONG_WARNING' | 'PROBATION' | 'SUSPEND'
) {
  const message = generateWarningMessage(action, reason);

  const result = await prisma.$queryRaw`
    SELECT issue_warning(
      ${userId},
      ${reason},
      ${JSON.stringify(detectionMetrics)}::jsonb,
      ${action},
      ${message}
    ) as warning_id
  `;

  // Send notification to user
  await sendWarningNotification(userId, message);

  return result[0].warning_id;
}

function generateWarningMessage(action: string, reason: string) {
  const messages = {
    WARNING: `⚠️ Warning: ${reason}. Please review our community guidelines.`,
    STRONG_WARNING: `⚠️ Strong Warning: ${reason}. Continued violations may result in probation.`,
    PROBATION: `🚫 Your account is now on probation for 7 days. ${reason}. Earnings will be held during this period.`,
    SUSPEND: `🚫 Your account has been suspended. ${reason}. Please contact support to appeal.`
  };
  return messages[action];
}
```

### Check User Status Before Engagement

```typescript
async function checkUserStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      status: true,
      probation_until: true,
      suspended_at: true,
      trust_score: true
    }
  });

  if (user.status === 'SUSPENDED') {
    throw new Error('Account suspended. Please contact support.');
  }

  if (user.status === 'PROBATION' && user.probation_until > new Date()) {
    return {
      allowed: true,
      warning: `Your account is on probation until ${user.probation_until.toLocaleDateString()}. Earnings will be held.`,
      holdEarnings: true
    };
  }

  return { allowed: true, holdEarnings: false };
}
```

### Calculate Risk Score (NATURAL Mode)

```typescript
async function calculateRiskScore(postId: string, userId: string) {
  // Your existing detection logic
  const velocityScore = await checkVelocity(userId);
  const qualityScore = await calculateQuality(postId);
  const diversityScore = await calculateDiversity(postId);

  // Get thresholds from config
  const config = await prisma.platform_config.findUnique({
    where: { key: 'natural_config' }
  });
  const thresholds = config.value.warning_thresholds;

  // Determine action
  if (
    velocityScore > thresholds.probation.velocity ||
    qualityScore < thresholds.probation.quality ||
    diversityScore < thresholds.probation.diversity
  ) {
    return { action: 'PROBATION', scores: { velocityScore, qualityScore, diversityScore } };
  }

  if (
    velocityScore > thresholds.strong_warning.velocity ||
    qualityScore < thresholds.strong_warning.quality ||
    diversityScore < thresholds.strong_warning.diversity
  ) {
    return { action: 'STRONG_WARNING', scores: { velocityScore, qualityScore, diversityScore } };
  }

  if (
    velocityScore > thresholds.warning.velocity ||
    qualityScore < thresholds.warning.quality ||
    diversityScore < thresholds.warning.diversity
  ) {
    return { action: 'WARNING', scores: { velocityScore, qualityScore, diversityScore } };
  }

  return { action: null, scores: { velocityScore, qualityScore, diversityScore } };
}
```

### Hold Earnings During Probation

```typescript
async function recordEarnings(userId: string, postId: string, amount: number) {
  const userStatus = await checkUserStatus(userId);

  if (userStatus.holdEarnings) {
    // Hold earnings until probation ends
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { probation_until: true }
    });

    await prisma.earnings.create({
      data: {
        userId,
        postId,
        amount,
        held_until: user.probation_until,
        hold_reason: 'Account on probation - earnings held until probation period ends'
      }
    });
  } else {
    // Release earnings immediately
    await prisma.earnings.create({
      data: { userId, postId, amount }
    });
  }
}
```

---

## Admin Dashboard Integration

### View Active Warnings

```typescript
// pages/api/admin/warnings.ts
export async function GET(req: NextRequest) {
  const warnings = await prisma.$queryRaw`
    SELECT * FROM active_warnings_summary
    ORDER BY last_warning_at DESC
  `;

  return NextResponse.json({ warnings });
}
```

### Clear a Warning

```typescript
// pages/api/admin/warnings/[id]/clear.ts
export async function POST(req: NextRequest, { params }) {
  const { adminId, notes } = await req.json();

  const result = await prisma.$queryRaw`
    SELECT clear_warning(${params.id}, ${adminId}) as success
  `;

  if (result[0].success) {
    // Log action
    await prisma.admin_log.create({
      data: {
        adminId,
        action: 'CLEAR_WARNING',
        targetId: params.id,
        notes
      }
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Warning not found' }, { status: 404 });
}
```

### Switch Platform Mode

```typescript
// pages/api/admin/config/mode.ts
export async function POST(req: NextRequest) {
  const { mode, adminId } = await req.json();

  if (!['BETA', 'NATURAL'].includes(mode)) {
    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  }

  await prisma.platform_config.update({
    where: { key: 'mode' },
    data: {
      value: JSON.stringify(mode),
      updated_at: new Date(),
      updated_by: adminId
    }
  });

  return NextResponse.json({ mode });
}
```

---

## Cron Jobs

### Auto-Clear Expired Probations

Run daily to automatically restore users whose probation has ended.

```typescript
// pages/api/cron/clear-probations.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await prisma.$queryRaw`
    SELECT auto_clear_expired_probations() as count
  `;

  return NextResponse.json({
    success: true,
    clearedCount: result[0].count,
    timestamp: new Date().toISOString()
  });
}
```

**vercel.json:**
```json
{
  "crons": [
    {
      "path": "/api/cron/clear-probations",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

---

## Testing Checklist

### BETA Mode Testing
- [ ] Rate limiting works (20/5min)
- [ ] Daily cap enforced (10,000 tokens)
- [ ] Low quality posts flagged
- [ ] Low diversity posts flagged
- [ ] Earnings held for flagged posts
- [ ] Admin can review flagged posts
- [ ] Admin can clear false positives

### NATURAL Mode Testing
- [ ] No hard caps on earnings
- [ ] WARNING issued for medium risk
- [ ] STRONG_WARNING issued for high risk
- [ ] PROBATION issued for very high risk
- [ ] Earnings held during probation
- [ ] Probation auto-clears after 7 days
- [ ] Trust score penalties applied
- [ ] Trust score restored when warning cleared
- [ ] Suspended users cannot engage
- [ ] Admin can clear warnings
- [ ] Admin can unsuspend users

### Mode Switching
- [ ] Can switch from BETA to NATURAL
- [ ] Can switch from NATURAL to BETA
- [ ] Mode persists across restarts
- [ ] Mode change logged with admin ID

---

## Migration Details

**File:** `/Users/davidsime/contentlynk-migrations/add_mode_system_complete.sql`

**What it does:**
1. Adds `trust_score`, `status`, `probation_until`, `suspended_at` to `users`
2. Adds `held_until`, `hold_reason` to `earnings`
3. Creates `creator_warnings` table
4. Creates `platform_config` table
5. Creates helper functions
6. Creates admin views
7. Sets default mode to BETA

**To run:**
```bash
node /Users/davidsime/contentlynk-migrations/run-complete-migration.js
```

**Status:** ✅ DEPLOYED (October 12, 2025)

---

## Configuration Guide

### Adjusting BETA Mode Thresholds

```sql
UPDATE platform_config
SET value = jsonb_set(value, '{daily_cap}', '15000')
WHERE key = 'beta_config';
```

### Adjusting NATURAL Mode Warning Thresholds

```sql
UPDATE platform_config
SET value = jsonb_set(
  value,
  '{warning_thresholds,warning,velocity}',
  '60'
)
WHERE key = 'natural_config';
```

### Changing Probation Duration

```sql
UPDATE platform_config
SET value = jsonb_set(
  value,
  '{probation_duration_days}',
  '14'
)
WHERE key = 'natural_config';
```

---

## Troubleshooting

### Issue: Probation not auto-clearing

**Solution:** Ensure cron job is running:
```bash
vercel logs /api/cron/clear-probations
```

### Issue: Trust scores not updating

**Solution:** Check if issue_warning function executed:
```sql
SELECT * FROM creator_warnings
WHERE creator_id = 'user_123'
ORDER BY created_at DESC
LIMIT 1;
```

### Issue: Mode switch not taking effect

**Solution:** Verify config update:
```sql
SELECT * FROM platform_config WHERE key = 'mode';
```

---

## Best Practices

1. **Start in BETA mode** - Test detection accuracy before going NATURAL
2. **Monitor false positives** - Adjust thresholds if too many false positives
3. **Clear warnings promptly** - Don't let legitimate creators stay in probation
4. **Log all admin actions** - Maintain audit trail
5. **Review probation cases weekly** - Some may need manual intervention
6. **Communicate with creators** - Explain why they were warned
7. **Switch to NATURAL gradually** - Monitor impact closely

---

## Support

For questions or issues:
- Check this documentation first
- Review migration logs: `/Users/davidsime/contentlynk-migrations/`
- Test queries against database
- Contact development team

---

**Last Updated:** October 12, 2025
**Version:** 1.0
**Status:** Production Ready ✅
