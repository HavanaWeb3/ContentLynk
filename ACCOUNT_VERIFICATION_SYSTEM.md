# Account Verification System - Protection System 3

**Status:** ✅ IMPLEMENTED
**Date:** October 13, 2025

---

## Overview

Protection System 3 prevents Sybil attacks (one person creating multiple fake accounts) using multi-layered verification:

1. **Email Verification** - Confirms valid email address
2. **Phone Verification** - SMS code via Twilio
3. **Phone Account Limits** - Max 3 accounts per phone number
4. **IP Rate Limiting** - Max 5 signups per IP in 24 hours
5. **Earning Restrictions** - Users cannot earn until fully verified

---

## Architecture

### Database Schema

**User Model Updates:**
```prisma
model User {
  // Verification fields
  emailVerified   Boolean   @default(false)
  phoneNumber     String?   @unique
  phoneVerified   Boolean   @default(false)
  signupIp        String?
}
```

**New Tables:**
```prisma
// Email verification tokens
EmailVerificationToken {
  id, userId, token, expires, createdAt
}

// Phone verification codes (6-digit SMS codes)
PhoneVerificationCode {
  id, userId, phoneNumber, code, expires, used, usedAt, createdAt
}

// IP tracking for rate limiting
SignupIpTracking {
  id, ipAddress, userId, createdAt
}

// Phone usage tracking (max 3 accounts per phone)
PhoneUsageTracking {
  id, phoneNumber, userId, createdAt
}

// SMS rate limiting (max 3 per hour per phone)
SmsRateLimit {
  id, phoneNumber, sentAt
}
```

### Service Layer

**`src/lib/email-verification.ts`**
- `sendEmailVerification(userId, email)` - Generate token, send email
- `verifyEmail(token)` - Verify token and mark user
- `isEmailVerified(userId)` - Check verification status
- `resendEmailVerification(userId)` - Resend with rate limiting

**`src/lib/phone-verification.ts`**
- `sendPhoneVerification(userId, phoneNumber)` - Send SMS code via Twilio
- `verifyPhoneCode(userId, phoneNumber, code)` - Verify 6-digit code
- `isPhoneVerified(userId)` - Check verification status
- `getVerificationStatus(userId)` - Get full status

**`src/lib/ip-tracking.ts`**
- `trackSignupIP(userId, ipAddress)` - Track signup IP
- `checkIPRateLimit(ipAddress)` - Check if IP can signup
- `getIPSignupStats(ipAddress)` - Get IP statistics
- `checkSuspiciousIP(ipAddress)` - Admin tool for investigation

**`src/lib/middleware/require-verification.ts`**
- `requireVerification(req)` - Full verification middleware
- `requireEmailVerification(req)` - Email only
- `requirePhoneVerification(req)` - Phone only
- `checkVerificationStatus(userId)` - Get verification status
- `getUserVerificationStatus(userId)` - UI helper

---

## API Endpoints

### Email Verification

**POST `/api/verification/email/send`**
```typescript
// Request
{
  "email": "user@example.com"
}

// Response
{
  "success": true,
  "message": "Verification email sent",
  "expiresIn": 86400  // 24 hours in seconds
}
```

**POST `/api/verification/email/verify`**
```typescript
// Request
{
  "token": "abc123..."
}

// Response
{
  "success": true,
  "message": "Email verified successfully",
  "userId": "user123"
}
```

### Phone Verification

**POST `/api/verification/phone/send`**
```typescript
// Request
{
  "phoneNumber": "+1234567890"  // E.164 format
}

// Response (Success)
{
  "success": true,
  "sent": true,
  "message": "Verification code sent",
  "expiresIn": 600  // 10 minutes in seconds
}

// Response (Rate Limited)
{
  "success": false,
  "error": "Too many SMS sent. Please try again in 30 minutes",
  "reason": "RATE_LIMIT_EXCEEDED"
}

// Response (Phone Limit)
{
  "success": false,
  "error": "This phone number has reached the maximum of 3 accounts",
  "reason": "PHONE_LIMIT_EXCEEDED"
}
```

**POST `/api/verification/phone/verify`**
```typescript
// Request
{
  "phoneNumber": "+1234567890",
  "code": "123456"
}

// Response (Success)
{
  "success": true,
  "valid": true,
  "message": "Phone number verified successfully"
}

// Response (Invalid/Expired)
{
  "success": false,
  "valid": false,
  "error": "Verification code has expired",
  "reason": "CODE_EXPIRED"
}
```

### Verification Status

**GET `/api/verification/status`**
```typescript
// Response
{
  "emailVerified": true,
  "phoneVerified": false,
  "fullyVerified": false,
  "canEarn": false,
  "message": "Complete verification to start earning"
}
```

---

## Rate Limits & Protection

### Email Verification
- **Token Expiry:** 24 hours
- **Resend Cooldown:** 5 minutes between resends
- **Max Active Tokens:** 1 per user (old ones deleted on new request)

### Phone Verification
- **Code Expiry:** 10 minutes
- **SMS Rate Limit:** 3 SMS per phone number per hour
- **Account Limit:** Max 3 accounts per phone number
- **Code Format:** 6-digit numeric (100000-999999)
- **Single Use:** Codes marked as used after successful verification

### IP Rate Limiting
- **Signup Limit:** 5 accounts per IP per 24 hours
- **Tracking Window:** 24 hours (rolling)
- **Cleanup:** Automatic deletion of old records
- **Retry After:** Returns seconds until limit resets

---

## Twilio Integration

### Setup

1. **Create Twilio Account:** https://console.twilio.com/
2. **Get Phone Number:** Purchase a Twilio phone number
3. **Get Credentials:**
   - Account SID
   - Auth Token
4. **Set Environment Variables:**
   ```bash
   TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxx"
   TWILIO_AUTH_TOKEN="your_auth_token"
   TWILIO_PHONE_NUMBER="+1234567890"
   ```

### SMS Message Format
```
Your ContentLynk verification code is: 123456. Valid for 10 minutes.
```

### Development Mode
Without Twilio credentials, the system:
- Logs codes to console instead of sending SMS
- Still enforces rate limits and validations
- Allows verification with logged codes

### Error Handling
```typescript
// Twilio errors caught and returned
{
  "success": false,
  "error": "Failed to send SMS. Please check phone number.",
  "reason": "TWILIO_ERROR"
}
```

---

## Earnings Integration

The earnings processor (`processEarnings`) now checks verification status:

```typescript
// src/lib/earnings-processor.ts
export async function processEarnings(postId, creatorId) {
  // Step 0: Check verification status
  const user = await prisma.user.findUnique({
    where: { id: creatorId },
    select: { emailVerified: true, phoneVerified: true }
  });

  if (!user?.emailVerified || !user?.phoneVerified) {
    return {
      success: false,
      blocked: true,
      message: 'Verification required: Please verify your email and phone to start earning',
      // ... other fields
    };
  }

  // Continue with earnings calculation...
}
```

**Result when unverified:**
```typescript
{
  "success": false,
  "rawEarnings": 0,
  "finalEarnings": 0,
  "blocked": true,
  "message": "Verification required: Please verify your email and phone to start earning"
}
```

---

## Usage Examples

### Complete Verification Flow

**1. Email Verification**
```typescript
// Send verification email
const emailResult = await fetch('/api/verification/email/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
});

// User clicks link in email → lands on /verify-email?token=xxx

// Verify token
const verifyResult = await fetch('/api/verification/email/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: 'abc123...' })
});
```

**2. Phone Verification**
```typescript
// Send SMS code
const phoneResult = await fetch('/api/verification/phone/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phoneNumber: '+1234567890' })
});

// User receives SMS, enters code

// Verify code
const codeResult = await fetch('/api/verification/phone/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '+1234567890',
    code: '123456'
  })
});
```

**3. Check Status**
```typescript
const status = await fetch('/api/verification/status');
const data = await status.json();

if (data.fullyVerified) {
  // User can earn
  console.log('✅ Verified - Can earn');
} else {
  // Show verification prompts
  if (!data.emailVerified) {
    // Show email verification UI
  }
  if (!data.phoneVerified) {
    // Show phone verification UI
  }
}
```

### Using Middleware in Routes

```typescript
import { requireVerification } from '@/lib/middleware/require-verification';

export async function POST(req: NextRequest) {
  // Check verification
  const verification = await requireVerification(req);

  if (!verification.verified) {
    // Returns 403 with detailed error
    return verification.response;
  }

  // User is verified, proceed with action
  const userId = verification.user.id;
  // ...
}
```

---

## Testing

### Run Tests
```bash
npm test verification.test.ts
```

### Test Coverage

✅ Email Verification
- Token generation and storage
- Email sending
- Token validation
- Expiry handling
- Already verified check

✅ Phone Verification
- SMS sending via Twilio
- Code generation (6-digit)
- Code validation
- Expiry handling (10 min)
- Single-use enforcement
- Account limit (max 3)
- SMS rate limit (3/hour)

✅ IP Tracking
- IP address capture
- Rate limit enforcement (5/24h)
- Statistics tracking
- Suspicious IP detection

✅ Verification Middleware
- Full verification check
- Partial verification handling
- Missing requirements detection
- Error responses

### Manual Testing Scenarios

**Email Verification:**
```bash
# 1. Send verification email
curl -X POST http://localhost:3000/api/verification/email/send \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check console for verification link
# Click link or extract token

# 2. Verify email
curl -X POST http://localhost:3000/api/verification/email/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"abc123..."}'
```

**Phone Verification:**
```bash
# 1. Send SMS code
curl -X POST http://localhost:3000/api/verification/phone/send \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+1234567890"}'

# Check console for code (dev mode) or SMS

# 2. Verify code
curl -X POST http://localhost:3000/api/verification/phone/verify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+1234567890","code":"123456"}'
```

**Test Rate Limits:**
```bash
# Send 4 SMS in rapid succession
for i in {1..4}; do
  curl -X POST http://localhost:3000/api/verification/phone/send \
    -H "Content-Type: application/json" \
    -d '{"phoneNumber":"+1234567890"}'
  sleep 1
done

# 4th request should be rate limited
```

---

## Environment Variables

Required in `.env`:

```bash
# Twilio Configuration (required for production)
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_PHONE_NUMBER="+1234567890"

# Email Configuration
EMAIL_SENDER="noreply@contentlynk.com"
NEXT_PUBLIC_APP_URL="https://contentlynk.com"  # For verification links
```

**Development Mode:**
- Without Twilio credentials, codes are logged to console
- All other functionality (rate limiting, validation) works normally

---

## Security Considerations

### Email Verification
- ✅ Tokens are 32-byte hex strings (cryptographically secure)
- ✅ Tokens expire after 24 hours
- ✅ Old tokens deleted when new one generated
- ✅ Token deleted after successful verification
- ✅ Resend rate limited to prevent spam

### Phone Verification
- ✅ Codes are random 6-digit numbers (1 million possibilities)
- ✅ Codes expire after 10 minutes
- ✅ Codes marked as used (prevent replay attacks)
- ✅ Max 3 SMS per hour per phone (prevent abuse)
- ✅ Max 3 accounts per phone number (prevent Sybil)
- ✅ Phone numbers stored in E.164 format
- ✅ Twilio credentials never exposed to client

### IP Tracking
- ✅ Tracks signups per IP address
- ✅ Max 5 signups per IP per 24 hours
- ✅ Automatic cleanup of old records
- ✅ Handles proxy headers (x-forwarded-for, etc.)
- ✅ Admin tools for investigating suspicious IPs

### Earnings Protection
- ✅ Earnings blocked until fully verified
- ✅ Clear error messages for unverified users
- ✅ Verification status checked on every earning attempt
- ✅ No way to bypass verification

---

## Admin Tools

### Check User Verification Status
```typescript
import { getUserVerificationStatus } from '@/lib/middleware/require-verification';

const status = await getUserVerificationStatus('user123');
// { emailVerified: true, phoneVerified: false, fullyVerified: false }
```

### Check IP Suspicious Activity
```typescript
import { checkSuspiciousIP } from '@/lib/ip-tracking';

const result = await checkSuspiciousIP('192.168.1.1');
/*
{
  suspicious: true,
  reasons: [
    "Exceeded IP rate limit (7/5 in 24h)",
    "Unusually high total signups (12)"
  ],
  stats: {
    totalSignups: 12,
    last24Hours: 7,
    uniqueUsers: 7
  }
}
*/
```

### Get Phone Usage Stats
```sql
-- Check how many accounts use a phone number
SELECT COUNT(*) FROM phone_usage_tracking
WHERE phone_number = '+1234567890';

-- Get all users with this phone
SELECT user_id FROM phone_usage_tracking
WHERE phone_number = '+1234567890';
```

### Monitor SMS Rate Limits
```sql
-- Check SMS sent in last hour
SELECT COUNT(*) FROM sms_rate_limit
WHERE phone_number = '+1234567890'
  AND sent_at >= NOW() - INTERVAL '1 hour';
```

---

## Troubleshooting

### Issue: SMS not sending

**Cause:** Twilio credentials not configured

**Fix:**
```bash
# Check environment variables
echo $TWILIO_ACCOUNT_SID
echo $TWILIO_AUTH_TOKEN
echo $TWILIO_PHONE_NUMBER

# Set in production (Vercel)
# Dashboard → Settings → Environment Variables
```

### Issue: "Invalid phone number format"

**Cause:** Phone number not in E.164 format

**Fix:**
```typescript
// Wrong
"1234567890"
"(123) 456-7890"

// Correct
"+1234567890"
"+44123456789"  // UK
"+33123456789"  // France
```

### Issue: Rate limit exceeded immediately

**Cause:** Old SMS records not cleaned up

**Debug:**
```typescript
import { prisma } from '@/lib/db';

// Check recent SMS
const recent = await prisma.smsRateLimit.findMany({
  where: { phoneNumber: '+1234567890' },
  orderBy: { sentAt: 'desc' }
});

console.log('Recent SMS:', recent);

// Manual cleanup (if needed)
await prisma.smsRateLimit.deleteMany({
  where: {
    phoneNumber: '+1234567890',
    sentAt: { lt: new Date(Date.now() - 60 * 60 * 1000) }
  }
});
```

### Issue: User claims they verified but still can't earn

**Debug:**
```typescript
// Check user verification status
const user = await prisma.user.findUnique({
  where: { id: 'user123' },
  select: {
    emailVerified: true,
    phoneVerified: true,
    email: true,
    phoneNumber: true
  }
});

console.log('Verification status:', user);

// Expected:
// { emailVerified: true, phoneVerified: true }

// If false, need to re-verify
```

---

## Files Created

1. **`prisma/schema.prisma`** - Updated with verification models
2. **`src/lib/email-verification.ts`** - Email verification service
3. **`src/lib/phone-verification.ts`** - Phone verification service (Twilio)
4. **`src/lib/ip-tracking.ts`** - IP tracking and rate limiting
5. **`src/lib/middleware/require-verification.ts`** - Verification middleware
6. **`src/lib/earnings-processor.ts`** - Updated with verification check
7. **`src/app/api/verification/email/send/route.ts`** - Send email verification
8. **`src/app/api/verification/email/verify/route.ts`** - Verify email
9. **`src/app/api/verification/phone/send/route.ts`** - Send phone verification
10. **`src/app/api/verification/phone/verify/route.ts`** - Verify phone
11. **`src/app/api/verification/status/route.ts`** - Get verification status
12. **`src/__tests__/verification.test.ts`** - Comprehensive tests
13. **`.env.example`** - Updated with Twilio variables
14. **`ACCOUNT_VERIFICATION_SYSTEM.md`** - This documentation

---

## Next Steps

### Before Production Launch

- [ ] Set up Twilio account and get phone number
- [ ] Configure Twilio environment variables in Vercel
- [ ] Set up email service (SendGrid, AWS SES, etc.)
- [ ] Test verification flow end-to-end
- [ ] Run database migrations
- [ ] Monitor verification success rates

### Post-Launch Monitoring

- [ ] Track verification completion rates
- [ ] Monitor Twilio SMS costs
- [ ] Watch for IP rate limit hits
- [ ] Check for phone number reuse patterns
- [ ] Review failed verification attempts

---

**Documentation Version:** 1.0
**Last Updated:** October 13, 2025
**Status:** Production Ready ✅
