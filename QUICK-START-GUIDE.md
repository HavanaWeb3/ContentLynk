# 🚀 Contentlynk Quick Start Guide

## ⚡ **Get Running in 5 Minutes**

### **1. Clone & Install**
```bash
# Navigate to the contentlynk directory
cd contentlynk

# Install dependencies (use --force if npm cache issues)
npm install --force

# Generate Prisma client
npx prisma generate
```

### **2. Database Setup**
```bash
# Option A: Local PostgreSQL
createdb contentlynk_dev
npx prisma db push

# Option B: Use SQLite for quick testing
# Edit .env: DATABASE_URL="file:./dev.db"
npx prisma db push
```

### **3. Environment Configuration**
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with minimum required values:
DATABASE_URL="postgresql://postgres:password@localhost:5432/contentlynk_dev"
NEXTAUTH_SECRET="development-secret-key-2024"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_USE_MOCK_NFTS="true"
```

### **4. Start Development Server**
```bash
npm run dev
```

### **5. Test the Complete Flow**
```bash
# Open: http://localhost:3000
# 1. Create account
# 2. Go to dashboard
# 3. Connect test wallet (use: 0x1111...1111)
# 4. Watch automatic Genesis tier assignment
# 5. See earnings calculations adjust
```

## 🧪 **Instant Testing with Mock Wallets**

### **Pre-configured Test Addresses**

**Copy-paste these addresses for immediate testing:**

```bash
# GENESIS TIER (75%) - Crown emoji, Indigo colors
0x1111111111111111111111111111111111111111

# PLATINUM TIER (70%) - Diamond emoji, Purple colors
0x2222222222222222222222222222222222222222

# GOLD TIER (65%) - Trophy emoji, Yellow colors
0x3333333333333333333333333333333333333333

# SILVER TIER (60%) - Medal emoji, Gray colors
0x4444444444444444444444444444444444444444

# STANDARD TIER (55%) - Star emoji, Blue colors
0x5555555555555555555555555555555555555555

# MIXED HOLDINGS (70%) - Gets highest tier
0x6666666666666666666666666666666666666666
```

### **What Each Test Shows**

**Genesis Test (0x1111...1111):**
- Owns Genesis NFT #42
- Gets maximum 75% revenue share
- Shows Genesis priority over other NFTs

**Platinum Test (0x2222...2222):**
- Owns Main Collection Token #8500 (Platinum range)
- Gets 70% revenue share
- Shows Token ID-based tier assignment

**Mixed Holdings Test (0x6666...6666):**
- Owns tokens #1000 (Silver), #5000 (Gold), #8500 (Platinum)
- Gets Platinum tier (highest owned)
- Demonstrates priority system

## 🎯 **Key Features to Test**

### **✅ Wallet Connection**
- Multiple wallet support (MetaMask, WalletConnect, etc.)
- Automatic NFT verification on connect
- Persistent connection across page refreshes
- Clean disconnect functionality

### **✅ NFT Tier Detection**
- Instant tier assignment based on Token IDs
- Visual tier badges with emojis and colors
- Detailed Token ID display
- Tier upgrade hints

### **✅ Earnings System**
- Revenue share adjusts by tier
- Real-time earnings calculations
- Tier-based multipliers working
- Payout schedule and countdown

### **✅ User Experience**
- Responsive design on mobile
- Clear explanations and instructions
- Smooth loading states
- Helpful error messages

## 🔧 **Development Tips**

### **Console Debugging**
```bash
# Open browser console to see:
✅ "Mock verification for 0x1111...1111"
✅ "Token #42 = GENESIS tier"
✅ "Membership tier updated successfully"
```

### **Database Inspection**
```bash
# View data in Prisma Studio
npx prisma studio

# Or check via SQL
psql contentlynk_dev -c "SELECT username, membershipTier, walletAddress FROM users;"
```

### **Force Dependency Install**
```bash
# If npm install fails with cache errors:
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --force
```

## 🔍 **Troubleshooting**

### **Common Issues & Solutions**

**"next: command not found"**
```bash
# Dependencies not installed properly
npm install --force
npx prisma generate
```

**"Database connection failed"**
```bash
# Check PostgreSQL is running
brew services start postgresql

# Or use SQLite for testing
# Edit .env: DATABASE_URL="file:./dev.db"
```

**"Wallet connection not working"**
```bash
# Make sure you're using a test wallet address exactly:
0x1111111111111111111111111111111111111111
# (not shortened version)
```

**"NFT verification stuck loading"**
```bash
# Check environment variable:
NEXT_PUBLIC_USE_MOCK_NFTS="true"
# Should be set for development
```

## 📱 **Mobile Testing**

### **Test on Mobile**
```bash
# Get your local IP
ipconfig getifaddr en0  # macOS
# Or: ip route get 1 | awk '{print $7}' # Linux

# Access from mobile
http://[YOUR_IP]:3000

# Test wallet connections:
# - MetaMask Mobile
# - WalletConnect apps
# - Touch interactions
```

## 🎯 **Demo Script (2 Minutes)**

### **Perfect Demo Flow**

**1. Landing Page (30 seconds)**
- Show value proposition
- Click "Get Started"

**2. Quick Registration (30 seconds)**
- Sign up with email
- Navigate to dashboard

**3. Standard User View (30 seconds)**
- Show 55% tier by default
- Point out earnings calculations
- Click "Connect Wallet"

**4. NFT Holder Transformation (30 seconds)**
- Connect 0x1111...1111 address
- Watch automatic upgrade to Genesis tier
- Show earnings increase from 55% → 75%
- Display Genesis NFT #42

**Key Message**: *"From 0 to Genesis tier in seconds - no manual verification, no waiting periods!"*

## 🔄 **Next Steps**

### **For Continued Development**
1. **Get Real API Keys**: WalletConnect + Alchemy
2. **Test Real Wallets**: Connect actual MetaMask/wallets
3. **Add Real Contracts**: When addresses available
4. **User Testing**: Get feedback from beta users
5. **Deploy Staging**: Vercel preview deployment

### **For Production**
1. **Contract Integration**: Real NFT contract addresses
2. **API Keys**: Production WalletConnect + Alchemy
3. **Database**: Production PostgreSQL
4. **Monitoring**: Error tracking and analytics
5. **Security**: Audit and penetration testing

---

## 🎉 **You're Ready!**

The Token ID-based NFT verification system is fully functional with:

✅ **Automatic tier detection** based on exact Token IDs
✅ **Real-time earnings adjustments** by membership tier
✅ **Professional wallet integration** with multiple providers
✅ **Comprehensive testing system** with mock data
✅ **Production-ready deployment** configuration

**🚀 Start testing now: `npm run dev` and visit http://localhost:3000**