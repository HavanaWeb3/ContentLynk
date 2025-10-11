# Admin Authentication Setup

This guide explains how to set up and use the admin authentication system for ContentLynk.

## 🔐 What's Been Added

### 1. Database Changes
- Added `isAdmin` boolean field to the User model (default: false)

### 2. Authentication Updates
- Extended NextAuth session to include `isAdmin` status
- Admin status is included in JWT tokens

### 3. Route Protection
- Created middleware (`src/middleware.ts`) to protect all `/admin/*` routes
- Unauthenticated users are redirected to sign-in page
- Non-admin authenticated users are redirected to home with error

### 4. Admin Page Security
- Updated `/admin/beta-applications` page with authentication checks
- Page shows loading state while checking auth
- Only admin users can view the page

## 🚀 Setup Instructions

### Step 1: Update Database Schema

Push the updated schema to your database:

```bash
cd /Users/davidsime/hvna-ecosystem/contentlynk
npx prisma db push
```

This will add the `isAdmin` field to all existing users (default: false).

### Step 2: Make Your User an Admin

First, create an account on your ContentLynk site if you haven't already:
1. Go to your ContentLynk URL
2. Sign up with your email and create an account

Then, make your user an admin using one of these methods:

**Method A: Using the Script (Recommended)**

```bash
npm run make-admin your@email.com
```

**Method B: Using Prisma Studio**

```bash
npx prisma studio
```

1. Open Prisma Studio (opens in browser at http://localhost:5555)
2. Click on "User" model
3. Find your user by email
4. Click on the row to edit
5. Set `isAdmin` to `true`
6. Click "Save 1 change"

**Method C: Direct Database Query**

```bash
npx prisma db execute --stdin <<EOF
UPDATE users SET "isAdmin" = true WHERE email = 'your@email.com';
EOF
```

### Step 3: Test the Protection

1. **Test without login:**
   - Go to `/admin/beta-applications`
   - Should redirect to sign-in page

2. **Test with non-admin user:**
   - Create a test account (new email)
   - Try to access `/admin/beta-applications`
   - Should redirect to home with unauthorized error

3. **Test with admin user:**
   - Sign in with your admin email
   - Go to `/admin/beta-applications`
   - Should see the admin dashboard

## 📁 Files Modified/Created

### Modified Files:
1. `prisma/schema.prisma` - Added `isAdmin` field to User model
2. `src/lib/auth.ts` - Updated JWT and session callbacks to include isAdmin
3. `src/app/admin/beta-applications/page.tsx` - Added authentication checks
4. `package.json` - Added make-admin script

### New Files:
1. `src/middleware.ts` - Middleware to protect admin routes
2. `scripts/make-admin.ts` - Script to make users admin
3. `ADMIN-SETUP.md` - This documentation file

## 🔧 How It Works

### Authentication Flow:

```
User visits /admin/beta-applications
         ↓
    Middleware checks authentication
         ↓
    ┌─────────────────────┐
    │  Not authenticated? │ → Redirect to /auth/signin
    └─────────────────────┘
         ↓
    Authenticated
         ↓
    ┌─────────────────────┐
    │  Not admin?         │ → Redirect to / with error
    └─────────────────────┘
         ↓
    Admin user
         ↓
    Show admin page
```

### Session Data:

```typescript
session.user = {
  id: string
  email: string
  username?: string
  displayName?: string
  isAdmin?: boolean  // ← New field
}
```

## 🛡️ Security Features

1. **Server-side protection:** Middleware runs on the server before page loads
2. **Client-side checks:** Page component checks authentication state
3. **JWT-based:** Admin status stored in JWT token (not just database)
4. **Automatic redirects:** Unauthorized users can't see admin content

## 📝 Adding More Admins

To add more admin users in the future:

```bash
# Method 1: Using the script
npm run make-admin another@email.com

# Method 2: Using Prisma Studio
npx prisma studio
# Then manually set isAdmin to true

# Method 3: In production via SQL
# Use your database client to run:
# UPDATE users SET "isAdmin" = true WHERE email = 'another@email.com';
```

## 🔍 Troubleshooting

### "Access Denied" after signing in as admin

1. Check that `isAdmin` is set to `true` in database:
   ```bash
   npx prisma studio
   ```

2. Sign out and sign in again to refresh the JWT token
3. Clear browser cookies if issue persists

### Script doesn't work

Install ts-node if not available:
```bash
npm install -D ts-node
npm run make-admin your@email.com
```

### Middleware not working

1. Make sure `src/middleware.ts` exists (not in `app` directory)
2. Restart the dev server: `npm run dev`
3. Check browser console for errors

## 🚀 Production Deployment

When deploying to production:

1. **Push database changes:**
   ```bash
   npx prisma db push
   ```

2. **Set your admin user:**
   ```bash
   npm run make-admin your@email.com
   ```

3. **Deploy your app:**
   ```bash
   vercel deploy --prod
   # or your deployment method
   ```

4. **Verify protection:**
   - Test that non-admin users can't access `/admin/*` routes
   - Test that admin users can access the page

## 📚 Next Steps

Consider adding:
- [ ] Admin dashboard home page
- [ ] Status update functionality for beta applications
- [ ] Email notifications when applications are approved/rejected
- [ ] Audit logs for admin actions
- [ ] Multiple admin roles (super admin, moderator, etc.)
- [ ] Admin user management interface

---

**Need help?** Check the ContentLynk documentation or contact the development team.
