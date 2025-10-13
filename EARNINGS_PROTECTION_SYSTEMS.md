# Earnings Protection Systems - BETA/NATURAL Mode

**Status:** ✅ IMPLEMENTED
**Date:** October 13, 2025

---

## Overview

ContentLynk's earnings system operates in two modes to ensure a smooth transition from testing to production:

- **BETA Mode:** 12-week testing phase with strict caps
- **NATURAL Mode:** Long-term production with unlimited earning potential

Mode switching is instant via environment variable - no code changes required.

---

## Earning Formula

### Quality Score Calculation
```
Quality Score = (likes × 1) + (comments × 5) + (shares × 20)
```

### Raw Earnings Calculation
```
Base Earnings = Quality Score × $0.10
Tier Multiplier = tier revenue share / 0.55
NFT Multiplier = 1.5 if has NFT, else 1.0
Raw Earnings = Base × Tier × NFT
```

### Example Calculations

**Example 1: Basic Post (STANDARD tier, no NFT)**
- Engagement: 100 likes, 10 comments, 5 shares
- Quality Score = (100 × 1) + (10 × 5) + (5 × 20) = 250
- Base Earnings = 250 × $0.10 = $25
- Tier Multiplier = 0.55 / 0.55 = 1.0
- NFT Multiplier = 1.0
- **Raw Earnings = $25**

**Example 2: Viral Post (GENESIS tier, has NFT)**
- Engagement: 500 likes, 50 comments, 10 shares
- Quality Score = (500 × 1) + (50 × 5) + (10 × 20) = 950
- Base Earnings = 950 × $0.10 = $95
- Tier Multiplier = 0.75 / 0.55 = 1.36
- NFT Multiplier = 1.5
- **Raw Earnings = $193.80**

---

## Mode Configurations

### BETA Mode (Testing - 12 weeks)

**Purpose:** Test detection systems and identify gaming patterns

**Caps:**
- Per-post maximum: **$100**
- Daily maximum: **$500**
- 3-day grace period for new accounts

**Behavior:**
```typescript
// Post earns $150
if (earnings > $100) {
  action = 'BLOCK';
  message = 'Earnings exceed $100 per-post cap';
  finalEarnings = $0;
}

// Daily total is $450, trying to add $100
if (dailyTotal + newEarnings > $500 && accountAge > 3 days) {
  action = 'BLOCK';
  message = 'Daily cap of $500 exceeded';
  finalEarnings = $0;
}
```

**Grace Period:**
- First 3 days: Daily cap NOT enforced
- Days 4+: Daily cap enforced
- Per-post cap: Always enforced

### NATURAL Mode (Post-launch)

**Purpose:** Sustainable long-term operation with creator freedom

**Caps:**
- Per-post maximum: **UNLIMITED**
- Daily maximum: **UNLIMITED**

**Behavior:**
```typescript
// Post earns $500
if (earnings > someSuspiciousThreshold) {
  action = 'WARN';
  message = 'High earnings flagged for review';
  trustScore -= penalty;
  finalEarnings = $500; // Still paid!
}
```

**Protection:**
- Warning system (not blocking)
- Trust score adjustments
- Probation for repeated violations
- Full earnings still paid during monitoring

---

## API Usage

### 1. Process Post Earnings

```typescript
import { processEarnings } from '@/lib/earnings-processor';

// After engagement action (like, comment, share)
const result = await processEarnings(postId, creatorId);

if (result.success) {
  // Earnings recorded
  console.log(`Earned: $${result.finalEarnings}`);
  console.log(`Mode: ${result.mode}`);

  if (result.cappedAmount) {
    // Was capped in BETA mode
    console.log(`Capped from: $${result.rawEarnings}`);
  }
} else {
  // Blocked (BETA mode only)
  console.log(`Blocked: ${result.message}`);
  console.log(`Reason: ${result.details}`);
}
```

### 2. Check Daily Limit Before Action

```typescript
import { checkDailyLimit } from '@/lib/earnings-processor';

// Before processing expensive engagement
const estimate = 50; // Estimated earnings
const check = await checkDailyLimit(creatorId, estimate);

if (!check.allowed) {
  return {
    error: 'Daily cap reached',
    message: check.message,
    currentTotal: check.currentDailyTotal,
  };
}

// Proceed with engagement
```

### 3. Calculate Raw Earnings (Preview)

```typescript
import { calculateRawEarnings } from '@/lib/earnings-processor';

// Preview what a post would earn
const preview = await calculateRawEarnings(postId, creatorId);

console.log('Quality Score:', preview.qualityScore);
console.log('Base Earnings:', preview.baseEarnings);
console.log('Tier Multiplier:', preview.tierMultiplier);
console.log('NFT Multiplier:', preview.nftMultiplier);
console.log('Raw Earnings:', preview.rawEarnings);
console.log('Breakdown:', preview.breakdown);
```

### 4. Get Creator Summary

```typescript
import { getCreatorEarningsSummary } from '@/lib/earnings-processor';

const summary = await getCreatorEarningsSummary(creatorId);

console.log('Total Earnings:', summary.total);
console.log('Today:', summary.today);
console.log('Pending:', summary.pending);
console.log('Daily Limit:', summary.dailyLimit); // null in NATURAL
console.log('Daily Remaining:', summary.dailyRemaining);
console.log('Grace Period:', summary.gracePeriodActive);
console.log('Mode:', summary.mode);
```

---

## Mode Switching

### How to Switch Modes

**Method 1: Environment Variable (Recommended)**

Update `.env`:
```bash
# Switch to NATURAL mode
PLATFORM_MODE="NATURAL"

# Or back to BETA
PLATFORM_MODE="BETA"
```

Then restart the application.

**Method 2: Vercel Environment Variables**

1. Go to Vercel dashboard
2. Navigate to Project Settings → Environment Variables
3. Update `PLATFORM_MODE` to `NATURAL` or `BETA`
4. Redeploy (or changes take effect on next build)

### Verification

Check logs on startup:
```
[Platform Mode] Running in BETA mode
[Platform Mode] Per-post cap: $100
[Platform Mode] Daily cap: $500
[Platform Mode] Action: BLOCK
```

Or:
```
[Platform Mode] Running in NATURAL mode
[Platform Mode] Per-post cap: UNLIMITED
[Platform Mode] Daily cap: UNLIMITED
[Platform Mode] Action: WARN
```

---

## Database Integration

### Tables Used

**earnings**
```sql
CREATE TABLE earnings (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  postId TEXT,
  amount DECIMAL NOT NULL,
  source TEXT NOT NULL,
  description TEXT,
  isPaid BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Mode system fields
  held_until TIMESTAMP,
  hold_reason TEXT
);
```

**users**
```sql
-- Relevant fields
membershipTier TEXT DEFAULT 'STANDARD',
totalEarnings DECIMAL DEFAULT 0,
isVerified BOOLEAN DEFAULT false,  -- NFT ownership
createdAt TIMESTAMP,  -- For grace period calculation
```

**posts**
```sql
-- Engagement metrics
likes INT DEFAULT 0,
comments INT DEFAULT 0,
shares INT DEFAULT 0,
earnings DECIMAL DEFAULT 0
```

---

## Testing

### Run Unit Tests

```bash
npm test earnings-processor.test.ts
```

### Test Coverage

✅ BETA mode caps enforced
✅ NATURAL mode no caps
✅ Grace period works correctly
✅ Tier multipliers accurate
✅ NFT multipliers accurate
✅ Quality score calculation
✅ Mode switching works
✅ Daily limit checking
✅ Per-post cap enforcement

### Manual Testing Scenarios

**BETA Mode:**
```bash
# 1. Set BETA mode
PLATFORM_MODE="BETA"

# 2. Test per-post cap
# Create post with 1000+ likes → Should cap at $100 or block

# 3. Test daily cap
# Earn $400 today, try to earn $150 more → Should block

# 4. Test grace period
# New account (< 3 days) → Should allow over daily cap
# Old account (> 3 days) → Should enforce daily cap
```

**NATURAL Mode:**
```bash
# 1. Set NATURAL mode
PLATFORM_MODE="NATURAL"

# 2. Test unlimited earnings
# Create post with 2000+ likes → Should pay full amount

# 3. Test no daily cap
# Earn $1000+ today → Should continue paying

# 4. Verify monitoring still works
# Check logs for warning flags
```

---

## Migration Path

### Week 1-4 (BETA Launch)
- Launch in BETA mode
- Monitor for gaming patterns
- Adjust detection thresholds
- Build confidence in system

### Week 5-8 (BETA Refinement)
- Analyze false positive rate
- Tune quality/diversity thresholds
- Improve detection algorithms
- Test warning system

### Week 9-12 (Transition Preparation)
- Build warning UI
- Test NATURAL mode internally
- Plan mode switch communication
- Prepare creator education

### Week 13+ (NATURAL Mode)
- Switch to NATURAL mode
- Monitor closely for 48 hours
- Ready to revert if needed
- Gradually relax monitoring

---

## Monitoring & Alerts

### Metrics to Track

**BETA Mode:**
- Posts hitting per-post cap
- Creators hitting daily cap
- Grace period usage
- Cap effectiveness

**NATURAL Mode:**
- High earning posts (>$200)
- High earning days (>$1000)
- Warning triggers
- Trust score trends

### Alerts to Configure

```typescript
// Alert if many creators hit caps (BETA)
if (dailyCapHits > 50) {
  alert('Many creators hitting daily cap - consider adjustment');
}

// Alert if suspicious pattern (NATURAL)
if (singlePostEarnings > $500) {
  alert('Unusually high single post earnings detected');
}
```

---

## Troubleshooting

### Issue: Earnings blocked in NATURAL mode

**Cause:** PLATFORM_MODE not set correctly

**Fix:**
```bash
# Check current mode
echo $PLATFORM_MODE

# Set to NATURAL
export PLATFORM_MODE="NATURAL"

# Restart application
npm run dev
```

### Issue: Grace period not working

**Cause:** Account age calculation error

**Debug:**
```typescript
const user = await prisma.user.findUnique({ where: { id } });
const accountAge = Math.floor(
  (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
);
console.log('Account age:', accountAge, 'days');
console.log('Grace period:', accountAge < 3 ? 'ACTIVE' : 'EXPIRED');
```

### Issue: Earnings calculation incorrect

**Cause:** Missing tier or NFT data

**Debug:**
```typescript
const raw = await calculateRawEarnings(postId, creatorId);
console.log('Quality Score:', raw.qualityScore);
console.log('Tier Multiplier:', raw.tierMultiplier);
console.log('NFT Multiplier:', raw.nftMultiplier);
console.log('Raw Earnings:', raw.rawEarnings);
```

---

## Best Practices

### 1. Always Check Mode Before UI Display

```typescript
import { isBetaMode } from '@/config/platform-mode';

{isBetaMode() && (
  <div className="warning">
    BETA: Earnings capped at $100/post, $500/day
  </div>
)}
```

### 2. Log Mode-Specific Events

```typescript
console.log(`[${mode}] Processing earnings for ${postId}`);
console.log(`[${mode}] Raw: $${raw}, Final: $${final}`);
if (blocked) {
  console.log(`[${mode}] BLOCKED: ${reason}`);
}
```

### 3. Graceful Degradation

```typescript
try {
  const result = await processEarnings(postId, creatorId);
  return result;
} catch (error) {
  console.error('Earnings processing failed:', error);
  // Still record engagement, process earnings later
  await recordPendingEarnings(postId, creatorId);
}
```

### 4. Test Mode Switching Thoroughly

```bash
# Switch modes and test immediately
PLATFORM_MODE="NATURAL" npm run dev

# Verify in logs
# Create test posts
# Check database for correct earnings
```

---

## Files Created

1. **`src/config/platform-mode.ts`** - Mode configuration
2. **`src/lib/earnings-processor.ts`** - Earnings logic
3. **`src/__tests__/earnings-processor.test.ts`** - Unit tests
4. **`.env.example`** - Environment variable documentation
5. **`EARNINGS_PROTECTION_SYSTEMS.md`** - This document

---

## Next Steps

### Immediate (Pre-Launch)
- [ ] Set `PLATFORM_MODE=BETA` in production
- [ ] Test all scenarios manually
- [ ] Monitor first week closely
- [ ] Document any issues

### Short-term (Weeks 1-12)
- [ ] Track cap hit rates
- [ ] Analyze gaming attempts
- [ ] Tune detection thresholds
- [ ] Build warning UI

### Long-term (Week 13+)
- [ ] Switch to NATURAL mode
- [ ] Monitor for 48 hours
- [ ] Gather creator feedback
- [ ] Iterate on trust system

---

**Documentation Version:** 1.0
**Last Updated:** October 13, 2025
**Status:** Production Ready ✅
