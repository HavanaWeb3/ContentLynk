# ContentLynk - Vercel Deployment Guide

## 🎉 Production Build Status: ✅ READY

Your ContentLynk platform is ready for deployment to Vercel!

---

## 📋 Pre-Deployment Checklist

### ✅ Completed
- [x] Production build successful
- [x] TypeScript compilation clean
- [x] All dependencies installed
- [x] wagmi v2 compatibility fixed

### 🔄 Required Before Deployment
- [ ] Get WalletConnect Project ID
- [ ] Set up Vercel Postgres database
- [ ] Configure environment variables in Vercel
- [ ] Push code to GitHub repository

---

## 🔑 Required Environment Variables

### Database (Vercel Postgres)
```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```
**How to get:** Create Vercel Postgres database in Vercel dashboard → Storage → Create Database

### Authentication
```env
NEXTAUTH_SECRET="generate-random-32-char-string"
NEXTAUTH_URL="https://contentlynk.vercel.app"
```
**How to generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Web3 & Wallet Connection
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-walletconnect-project-id"
```
**How to get:**
1. Go to https://cloud.walletconnect.com
2. Sign up (free)
3. Create new project called "ContentLynk"
4. Copy the Project ID

### Optional - Alchemy API (for production NFT verification)
```env
NEXT_PUBLIC_ALCHEMY_API_KEY="your-alchemy-api-key"
```
**How to get:**
1. Go to https://alchemy.com
2. Sign up (free tier is fine)
3. Create app for "Ethereum Mainnet" and "Polygon Mainnet"
4. Copy API key

### NFT Contract Addresses (use mocks for now)
```env
NEXT_PUBLIC_GENESIS_NFT_ADDRESS=""
NEXT_PUBLIC_MAIN_COLLECTION_ADDRESS=""
NEXT_PUBLIC_USE_MOCK_NFTS="true"
```
**Note:** Leave empty and set USE_MOCK_NFTS=true until contracts are deployed

### Image Upload (Vercel Blob Storage)
```env
BLOB_READ_WRITE_TOKEN="vercel_blob_token_will_be_auto_generated"
```
**How to get:** Vercel automatically generates this when you enable Blob storage

### Optional Settings
```env
NEXT_PUBLIC_ENABLE_TESTNETS="false"
```

---

## 🚀 Step-by-Step Deployment Instructions

### Step 1: Prepare GitHub Repository

```bash
# Navigate to contentlynk directory
cd /Users/davidsime/hvna-ecosystem/contentlynk

# Initialize git if not already done
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - ContentLynk ready for deployment"

# Create GitHub repository (via GitHub website)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/contentlynk.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `contentlynk`
   - Click "Import"

3. **Configure Build Settings**
   - Framework Preset: **Next.js** (auto-detected)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add ALL variables from the list above
   - Select "Production" environment
   - Click "Add" for each variable

5. **Create Database**
   - Before deploying, go to "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose region closest to users
   - Database will auto-generate `DATABASE_URL`

6. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Site will be live at: `https://contentlynk.vercel.app`

### Step 3: Initialize Database

After first deployment, run database migrations:

```bash
# In Vercel dashboard → Project → Settings → Functions
# Add this command to run once:
npx prisma db push
```

Or run locally connected to production:
```bash
# Copy DATABASE_URL from Vercel
DATABASE_URL="your-production-url" npx prisma db push
```

---

## 🧪 Post-Deployment Testing Checklist

### Authentication & User Management
- [ ] Visit https://contentlynk.vercel.app
- [ ] Click "Sign Up"
- [ ] Create test account
- [ ] Verify you can sign in
- [ ] Sign out works

### Content Creation
- [ ] Go to "Create" page
- [ ] Write post with title and content
- [ ] Upload image
- [ ] Publish post
- [ ] Post appears in dashboard

### Dashboard
- [ ] Dashboard loads
- [ ] Shows earnings (mock data initially)
- [ ] Can edit post
- [ ] Can delete post
- [ ] Stats display correctly

### Web3 Features (Optional - requires WalletConnect)
- [ ] Connect wallet button works
- [ ] Can connect MetaMask/WalletConnect
- [ ] NFT verification shows (mock or real)
- [ ] Membership tier displays

### Mobile Responsive
- [ ] Test on mobile device
- [ ] Navigation works
- [ ] Forms are usable
- [ ] Images display correctly

---

## 🔧 Troubleshooting

### Build Fails
**Error:** Module not found
**Solution:** Check package.json dependencies, run `npm install`

**Error:** Environment variable undefined
**Solution:** Add missing env var in Vercel dashboard

### Database Connection Fails
**Error:** Can't connect to database
**Solution:**
1. Check DATABASE_URL is correct
2. Ensure Vercel Postgres is created
3. Run `npx prisma db push` to create tables

### Images Don't Upload
**Error:** Upload failed
**Solution:**
1. Enable Vercel Blob storage
2. Check BLOB_READ_WRITE_TOKEN exists

### Wallet Connection Doesn't Work
**Error:** WalletConnect fails
**Solution:**
1. Verify NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is set
2. Ensure it's a valid project ID from cloud.walletconnect.com

---

## 📊 Production Monitoring

### Vercel Analytics
- Enable in Vercel dashboard → Analytics
- Track page views, performance, errors

### Database Monitoring
- Vercel Postgres dashboard shows:
  - Connection count
  - Query performance
  - Storage usage

### Logs
- View real-time logs: Vercel dashboard → Deployments → View Function Logs

---

## 🔒 Security Best Practices

### Before Going Public:
1. ✅ Implement proper password hashing (currently simplified)
2. ✅ Add rate limiting on API routes
3. ✅ Enable CORS protection
4. ✅ Set up proper CSP headers
5. ✅ Implement input sanitization
6. ✅ Add API key rotation
7. ✅ Set up monitoring/alerting

### Environment Variables Security:
- ✅ Never commit .env files to git
- ✅ Rotate NEXTAUTH_SECRET regularly
- ✅ Use Vercel's encrypted environment variables
- ✅ Limit API key permissions to minimum required

---

## 🎯 Next Steps After Deployment

### Immediate (Week 1)
1. Test all features thoroughly
2. Fix any production-specific bugs
3. Monitor error logs
4. Collect user feedback

### Short-term (Month 1)
1. Deploy real NFT contracts
2. Switch from mock NFTs to real verification
3. Implement actual token payments
4. Add more content features

### Long-term (Quarter 1)
1. Scale database as needed
2. Add CDN for images
3. Implement caching strategy
4. Add analytics dashboard

---

## 📞 Support Resources

### Vercel Documentation
- https://vercel.com/docs
- https://vercel.com/docs/storage/vercel-postgres

### Next.js Documentation
- https://nextjs.org/docs

### Prisma Documentation
- https://www.prisma.io/docs

### WalletConnect
- https://docs.walletconnect.com

---

## ✅ Deployment Summary

**What's Working:**
✅ Production build compiles successfully
✅ All TypeScript errors resolved
✅ wagmi v2 compatibility fixed
✅ Database schema ready
✅ Authentication system ready
✅ Content creation and management
✅ Mock NFT verification (for testing)
✅ Image upload capability

**What You Need:**
🔑 WalletConnect Project ID (5 minutes to get)
🔑 Vercel account (free)
🔑 GitHub repository
🗄️ Vercel Postgres database (created during deployment)

**Estimated Time to Deploy:** 30-45 minutes

**Your platform will be live at:** https://contentlynk.vercel.app

Good luck with your launch! 🚀