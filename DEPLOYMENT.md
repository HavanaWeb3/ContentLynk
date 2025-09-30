# Contentlynk Phase 1 - Deployment Guide

## 🚀 Quick Start (Development)

### 1. Dependencies Installation

Since there may be npm cache issues, try these alternatives:

**Option A: Force install (if npm cache issues)**
```bash
npm install --force
```

**Option B: Clear cache and reinstall**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Option C: Use alternative package manager**
```bash
# Install yarn if not available
npm install -g yarn

# Install dependencies with yarn
yarn install
```

### 2. Essential Dependencies

If installation fails, install core dependencies manually:

```bash
# Core Next.js dependencies
npm install next@14.2.5 react@18.2.0 react-dom@18.2.0

# TypeScript
npm install -D typescript @types/node @types/react @types/react-dom

# Styling
npm install tailwindcss autoprefixer postcss

# Database and Auth (when ready)
npm install @prisma/client prisma next-auth
```

### 3. Database Setup

**PostgreSQL Setup**
```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb contentlynk_dev

# Update .env with your database URL
DATABASE_URL="postgresql://username:password@localhost:5432/contentlynk_dev"
```

**Prisma Setup**
```bash
npx prisma generate
npx prisma db push
```

### 4. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## 🔧 Environment Configuration

### Required Environment Variables

Create `.env` file with:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/contentlynk_dev"

# NextAuth.js
NEXTAUTH_SECRET="contentlynk-secret-key-2024"
NEXTAUTH_URL="http://localhost:3000"

# Web3 (Placeholder for Phase 1)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID="placeholder"
NEXT_PUBLIC_ALCHEMY_API_KEY="placeholder"

# NFT Contracts (Base Network)
NEXT_PUBLIC_GENESIS_NFT_CONTRACT="0x0000000000000000000000000000000000000000"
NEXT_PUBLIC_MAIN_NFT_CONTRACT="0x0000000000000000000000000000000000000000"

# File Upload
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="placeholder"
CLOUDINARY_API_SECRET="placeholder"

# $HVNA Token
NEXT_PUBLIC_HVNA_TOKEN_CONTRACT="0x0000000000000000000000000000000000000000"
```

## 🚢 Production Deployment

### 1. Database Setup (PlanetScale)

```bash
# Install PlanetScale CLI
npm install -g @planetscale/cli

# Login and create database
pscale login
pscale database create contentlynk-prod

# Get connection string
pscale connect contentlynk-prod main --port 3309
```

### 2. Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL
# - All other production configs
```

### 3. Alternative: Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up
```

## 🐛 Troubleshooting

### Common Issues

**1. npm cache issues**
```bash
sudo chown -R $(whoami) ~/.npm
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**2. PostgreSQL connection issues**
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL
brew services start postgresql

# Check connection
psql -h localhost -p 5432 -U username -d contentlynk_dev
```

**3. Prisma issues**
```bash
# Reset Prisma client
npx prisma generate
npx prisma db push --force-reset
```

**4. Next.js build issues**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Development Without npm install

If npm continues to fail, you can work with the existing codebase:

1. **Manual dependency management**: Copy `node_modules` from the parent project
2. **Focus on core features**: Work on components and pages that don't require new packages
3. **Use CDN links**: For emergency dependencies, use CDN versions in development

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Build process succeeds locally
- [ ] Core features tested (auth, dashboard, create post)
- [ ] Responsive design verified
- [ ] Error handling implemented

### Post-deployment
- [ ] Database migrations applied
- [ ] SSL certificate configured
- [ ] Domain configured
- [ ] Error monitoring set up
- [ ] Analytics tracking enabled
- [ ] Backup strategy implemented

## 🔄 CI/CD Pipeline (Future)

### GitHub Actions Example

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🔐 Security Considerations

### Environment Security
- Never commit `.env` files
- Use strong secrets for production
- Rotate secrets regularly
- Use environment-specific configurations

### Database Security
- Enable SSL in production
- Use connection pooling
- Implement proper backup strategy
- Monitor for suspicious queries

### Application Security
- Implement rate limiting
- Validate all inputs
- Use HTTPS everywhere
- Secure cookie settings

## 📊 Monitoring & Analytics

### Error Tracking
- Sentry integration
- Custom error boundaries
- Comprehensive logging

### Performance Monitoring
- Core Web Vitals tracking
- Database query optimization
- CDN integration for assets

### Business Metrics
- User registration tracking
- Content creation metrics
- Earnings calculation accuracy
- Platform engagement rates

## 🚀 Scaling Considerations

### Database Scaling
- Read replicas for heavy queries
- Database indexing optimization
- Connection pooling
- Query optimization

### Application Scaling
- Horizontal scaling with load balancers
- CDN for static assets
- Caching strategies
- Background job processing

### Infrastructure
- Multi-region deployment
- Auto-scaling policies
- Health check endpoints
- Disaster recovery plan

---

**Need help?** Contact the development team or check our Discord community for support.