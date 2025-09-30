# 🚀 Contentlynk Production Deployment Guide

## 📋 **Pre-Deployment Checklist**

### **✅ API Keys Required**

**1. WalletConnect Project ID**
```bash
# Get from: https://walletconnect.com/
# Create account → New Project → Copy Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-project-id-here"
```

**2. Alchemy API Key**
```bash
# Get from: https://alchemy.com/
# Create account → New App → Copy API Key
NEXT_PUBLIC_ALCHEMY_API_KEY="your-alchemy-api-key-here"
```

**3. Database URL**
```bash
# Production PostgreSQL database
# Options: Vercel Postgres, Supabase, Neon, PlanetScale
DATABASE_URL="postgresql://user:password@host:5432/contentlynk_prod"
```

**4. NextAuth Secret**
```bash
# Generate secure secret:
openssl rand -base64 32

NEXTAUTH_SECRET="generated-secret-here"
NEXTAUTH_URL="https://your-domain.vercel.app"
```

### **✅ NFT Contract Addresses (When Available)**

**Replace mock addresses with real ones:**
```bash
# Genesis Collection (Ethereum Mainnet)
NEXT_PUBLIC_GENESIS_NFT_ADDRESS="0x[REAL_GENESIS_CONTRACT_ADDRESS]"

# Main Collection (Polygon Network)
NEXT_PUBLIC_MAIN_COLLECTION_ADDRESS="0x[REAL_MAIN_CONTRACT_ADDRESS]"
```

### **✅ Production Environment Settings**
```bash
NODE_ENV="production"
NEXT_PUBLIC_USE_MOCK_NFTS="false"  # Disable mock data
NEXT_PUBLIC_ENABLE_TESTNETS="false"  # Disable testnets
```

## 🔧 **Vercel Deployment Steps**

### **1. Deploy to Vercel**

**Option A: Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project directory
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set environment variables
# - Deploy
```

**Option B: GitHub Integration**
```bash
# 1. Push code to GitHub repository
# 2. Go to vercel.com → New Project
# 3. Import from GitHub
# 4. Configure build settings (auto-detected)
# 5. Set environment variables
# 6. Deploy
```

### **2. Environment Variables in Vercel**

**In Vercel Dashboard → Project → Settings → Environment Variables:**

```bash
# Database
DATABASE_URL = "postgresql://..."

# Authentication
NEXTAUTH_SECRET = "your-secure-secret"
NEXTAUTH_URL = "https://your-domain.vercel.app"

# Web3
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = "your-project-id"
NEXT_PUBLIC_ALCHEMY_API_KEY = "your-api-key"

# NFT Contracts
NEXT_PUBLIC_GENESIS_NFT_ADDRESS = "0x..."
NEXT_PUBLIC_MAIN_COLLECTION_ADDRESS = "0x..."

# Production Settings
NODE_ENV = "production"
NEXT_PUBLIC_USE_MOCK_NFTS = "false"
NEXT_PUBLIC_ENABLE_TESTNETS = "false"
```

### **3. Database Setup**

**Option A: Vercel Postgres**
```bash
# In Vercel Dashboard:
# 1. Go to Storage tab
# 2. Create → Postgres
# 3. Copy connection string
# 4. Add to environment variables

# Run migrations:
npx prisma db push
```

**Option B: Supabase**
```bash
# 1. Create account at supabase.com
# 2. New project → Get connection string
# 3. Set in environment variables
# 4. Run migrations:
npx prisma db push
```

### **4. Custom Domain (Optional)**
```bash
# In Vercel Dashboard → Project → Settings → Domains
# Add custom domain: contentlynk.com
# Configure DNS records as instructed
# SSL certificate auto-generated
```

## 🔒 **Security Configuration**

### **1. Environment Variables Security**
```bash
# Never commit .env files
# Use different secrets for production
# Rotate secrets regularly
# Limit API key permissions
```

### **2. Database Security**
```bash
# Enable SSL connections
# Use connection pooling
# Set up read replicas for scaling
# Regular backups configured
```

### **3. Application Security**
```bash
# CORS configuration in next.config.js
# Rate limiting on API routes
# Input validation on all endpoints
# Secure headers (configured in vercel.json)
```

## 📊 **Monitoring & Analytics**

### **1. Error Tracking**
```bash
# Recommended: Sentry
npm install @sentry/nextjs

# Configure in sentry.client.config.js:
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: process.env.NODE_ENV
})
```

### **2. Analytics**
```bash
# Vercel Analytics (built-in)
# Google Analytics
# Custom event tracking for Web3 interactions
```

### **3. Performance Monitoring**
```bash
# Vercel Speed Insights
# Core Web Vitals tracking
# API response time monitoring
# Database query performance
```

## 🧪 **Testing Production Build**

### **1. Local Production Testing**
```bash
# Build and test locally
npm run build
npm start

# Test all critical flows:
# - User registration
# - Wallet connection
# - NFT verification
# - Tier assignment
# - Earnings calculation
```

### **2. Staging Environment**
```bash
# Deploy to staging first
vercel --prod=false

# Full testing checklist:
# - All wallet types connect
# - NFT verification works
# - Database updates correctly
# - No console errors
# - Mobile responsive
```

## 🚀 **Go-Live Process**

### **1. Final Pre-Launch Checks**
```bash
✅ All environment variables set
✅ Database migrations applied
✅ Real contract addresses configured
✅ SSL certificate active
✅ Custom domain configured (if applicable)
✅ Error monitoring active
✅ Backup strategy implemented
```

### **2. Launch Day**
```bash
# 1. Deploy to production
vercel --prod

# 2. Verify all systems
# - Test user registration
# - Test wallet connections
# - Verify NFT detection
# - Check earnings calculations

# 3. Monitor for issues
# - Check error rates
# - Monitor response times
# - Watch user feedback
```

### **3. Post-Launch Monitoring**
```bash
# First 24 hours:
# - Monitor error rates closely
# - Check user registration flow
# - Verify NFT verification accuracy
# - Monitor database performance

# First week:
# - Gather user feedback
# - Monitor Web3 interaction success rates
# - Optimize any slow queries
# - Scale if needed
```

## 📈 **Scaling Considerations**

### **1. Database Scaling**
```bash
# Connection pooling
# Read replicas for queries
# Database indexing optimization
# Query performance monitoring
```

### **2. Application Scaling**
```bash
# Vercel auto-scales functions
# CDN for static assets
# Caching strategy for NFT data
# Rate limiting for API endpoints
```

### **3. Web3 Scaling**
```bash
# Multiple RPC providers
# Caching NFT verification results
# Batch blockchain requests
# Graceful fallbacks for RPC failures
```

## 🔧 **Maintenance & Updates**

### **1. Regular Maintenance**
```bash
# Weekly:
# - Monitor error rates
# - Check performance metrics
# - Review user feedback

# Monthly:
# - Update dependencies
# - Security audit
# - Database maintenance
# - Backup verification
```

### **2. NFT Contract Updates**
```bash
# When real contracts are deployed:
# 1. Update environment variables
# 2. Test with real NFT holders
# 3. Verify tier assignments
# 4. Deploy with zero downtime
```

### **3. Feature Updates**
```bash
# Use Vercel preview deployments
# Test new features thoroughly
# Gradual rollout for major changes
# Rollback plan for issues
```

## 🆘 **Emergency Procedures**

### **1. Rollback Plan**
```bash
# Vercel provides instant rollback
# Keep previous deployment ready
# Database migration rollback plan
# Communication plan for users
```

### **2. Incident Response**
```bash
# 1. Identify issue scope
# 2. Communicate with users
# 3. Implement fix or rollback
# 4. Post-incident review
```

## 📞 **Support Contacts**

### **Service Providers**
- **Vercel Support**: vercel.com/support
- **Alchemy Support**: alchemy.com/support
- **WalletConnect**: walletconnect.com/support

### **Monitoring Alerts**
```bash
# Set up alerts for:
# - High error rates (>5%)
# - Slow response times (>3s)
# - Database connection issues
# - Failed NFT verifications
```

---

## 🎯 **Success Metrics**

### **Launch Success Criteria**
- [ ] 99% uptime in first week
- [ ] <3 second page load times
- [ ] >95% successful wallet connections
- [ ] >95% successful NFT verifications
- [ ] Zero security incidents

### **User Experience Metrics**
- [ ] User registration completion rate >80%
- [ ] Wallet connection success rate >95%
- [ ] NFT tier assignment accuracy 100%
- [ ] Mobile usability score >90%

---

**🚀 Ready for production deployment with comprehensive monitoring and scaling strategies!**