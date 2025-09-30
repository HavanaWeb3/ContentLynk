# 🧪 Contentlynk Token ID-Based NFT Testing Guide

## 🎯 **NEW TOKEN ID TIER SYSTEM**

### **NFT Collections & Tier Assignment**

#### **👑 Genesis Collection (100 NFTs)**
- **Contract**: Ethereum Mainnet
- **Rule**: Any Genesis NFT = **GENESIS tier (75% revenue share)**
- **Priority**: Highest (overrides any main collection tier)

#### **🎨 Boldly Elephunky Main Collection (9,900 NFTs)**
- **Contract**: Polygon Network
- **Tier Assignment by Token ID**:
  - **Token IDs #1 to #2,970** = **SILVER tier (60%)**
  - **Token IDs #2,971 to #7,920** = **GOLD tier (65%)**
  - **Token IDs #7,921 to #9,900** = **PLATINUM tier (70%)**

#### **⭐ Standard Users**
- **No NFTs** = **STANDARD tier (55%)**

### **Multi-NFT Priority System**
If a user owns multiple NFTs, they get the **HIGHEST** tier they qualify for:
- Genesis NFT + Any main collection = **GENESIS (75%)**
- Multiple main collection tiers = **Highest qualifying tier**
- Example: Owns #1500 (Silver) + #8000 (Platinum) = **PLATINUM tier**

## 🧪 **Mock Testing System**

### **Test Wallet Addresses (Development)**

**Perfect for testing different scenarios:**

```typescript
// GENESIS TIER (75%) - Has Genesis NFT #42
0x1111111111111111111111111111111111111111

// PLATINUM TIER (70%) - Has Main Collection #8500
0x2222222222222222222222222222222222222222

// GOLD TIER (65%) - Has Main Collection #5000
0x3333333333333333333333333333333333333333

// SILVER TIER (60%) - Has Main Collection #1500
0x4444444444444444444444444444444444444444

// STANDARD TIER (55%) - No NFTs
0x5555555555555555555555555555555555555555

// MIXED HOLDINGS (Gets PLATINUM) - Has #1000, #5000, #8500
0x6666666666666666666666666666666666666666
```

### **Testing Token ID Ranges**

**Use these specific Token IDs to test tier boundaries:**

```bash
# Silver Tier Testing
Token #1     → Silver (bottom of range)
Token #1500  → Silver (middle of range)
Token #2970  → Silver (top of range)
Token #2971  → Gold (boundary test)

# Gold Tier Testing
Token #2971  → Gold (bottom of range)
Token #5000  → Gold (middle of range)
Token #7920  → Gold (top of range)
Token #7921  → Platinum (boundary test)

# Platinum Tier Testing
Token #7921  → Platinum (bottom of range)
Token #8500  → Platinum (middle of range)
Token #9900  → Platinum (top of range)
```

## 🔍 **Testing Scenarios**

### **1. Single NFT Testing**

**Test Each Tier:**
- Connect `0x1111...1111` → Should show Genesis tier (75%)
- Connect `0x2222...2222` → Should show Platinum tier (70%)
- Connect `0x3333...3333` → Should show Gold tier (65%)
- Connect `0x4444...4444` → Should show Silver tier (60%)
- Connect `0x5555...5555` → Should show Standard tier (55%)

**Expected UI Elements:**
- Correct tier badge with emoji
- Token ID display (e.g., "Token IDs: #42, #8500")
- Revenue share percentage
- Tier-specific colors

### **2. Multi-NFT Priority Testing**

**Mixed Holdings Test:**
- Connect `0x6666...6666` → Should show **PLATINUM** tier (70%)
- UI should display: "Token IDs: #1000, #5000, #8500"
- Should explain: "Highest tier from your NFTs"

**Genesis Priority Test:**
- If wallet has Genesis + Main Collection → Always Genesis tier
- Genesis overrides everything else

### **3. Tier Boundary Testing**

**Test Edge Cases:**
```bash
# Test token boundaries
#2970 vs #2971 (Silver vs Gold boundary)
#7920 vs #7921 (Gold vs Platinum boundary)

# Test invalid token IDs (should not grant tiers)
#0, #10000, #99999
```

### **4. Real-Time Verification**

**Dynamic Testing:**
- Connect wallet → Automatic verification
- Disconnect/Reconnect → Re-verification
- "Re-verify Holdings" button → Manual refresh
- Switch between test wallets → Immediate tier updates

## 🎨 **UI Testing Checklist**

### **✅ Wallet Connection Flow**
- [ ] Connect button works for all wallet types
- [ ] Wallet address displays correctly (0x1234...5678)
- [ ] Connection status indicators work
- [ ] Disconnect functionality works

### **✅ NFT Verification Display**
- [ ] Loading state shows during verification
- [ ] Genesis NFT count and Token IDs display
- [ ] Main collection count and Token IDs display
- [ ] Tier determination explanation shows
- [ ] Revenue share percentage correct

### **✅ Tier Badge System**
- [ ] Genesis: 👑 + Indigo colors
- [ ] Platinum: 💎 + Purple colors
- [ ] Gold: 🏆 + Yellow colors
- [ ] Silver: 🥈 + Gray colors
- [ ] Standard: ⭐ + Blue colors

### **✅ Token ID Details**
- [ ] Individual Token IDs listed (e.g., "#42, #1500, #8500")
- [ ] Tier ranges explained ("Silver: #1-2970")
- [ ] Collection separation (Genesis vs Main)
- [ ] Upgrade hints for higher tiers

### **✅ Development Mode Features**
- [ ] Test wallet addresses listed
- [ ] Development mode indicator
- [ ] Easy tier switching for testing
- [ ] Console logging for debugging

## 🚀 **Earnings Integration Testing**

### **Revenue Share Verification**

**Test earnings calculation with different tiers:**

```typescript
// Base earnings: 1000 views = 1.0 HVNA
// Tier multipliers:
Standard: 1.0 × 0.55 = 0.55 HVNA
Silver:   1.0 × 0.60 = 0.60 HVNA
Gold:     1.0 × 0.65 = 0.65 HVNA
Platinum: 1.0 × 0.70 = 0.70 HVNA
Genesis:  1.0 × 0.75 = 0.75 HVNA
```

**Dashboard Integration:**
- [ ] Earnings adjust when tier changes
- [ ] Revenue share percentage displays correctly
- [ ] Historical earnings reflect current tier
- [ ] Payout calculations use correct multiplier

## 🔧 **Technical Testing**

### **Console Debugging**

**Check browser console for:**
```bash
✅ "Mock verification for 0x1111...1111"
✅ "Token #42 = GENESIS tier"
✅ "User has 1 Genesis NFT(s) - GENESIS tier"
✅ "Membership tier updated successfully"
```

### **Network Tab Verification**
- [ ] `/api/user/update-membership` API calls succeed
- [ ] Correct tier data sent to database
- [ ] No unnecessary blockchain RPC calls
- [ ] Fast response times (<2 seconds)

### **Database Verification**
```sql
-- Check user tier updates
SELECT username, membershipTier, walletAddress
FROM users
WHERE walletAddress IS NOT NULL;
```

## 📱 **Mobile Testing**

### **Responsive Design**
- [ ] Wallet connection modal works on mobile
- [ ] NFT details display properly on small screens
- [ ] Tier badges readable on mobile
- [ ] Touch interactions work smoothly

### **Mobile Wallets**
- [ ] MetaMask Mobile connection
- [ ] WalletConnect mobile apps
- [ ] Deep linking works correctly
- [ ] QR code scanning functions

## 🚨 **Error Handling Testing**

### **Network Issues**
- [ ] RPC timeout handling
- [ ] Wrong network connected
- [ ] Wallet locked/disconnected
- [ ] Contract call failures

### **Edge Cases**
- [ ] Invalid wallet addresses
- [ ] Malformed Token IDs
- [ ] Empty NFT responses
- [ ] Database connection errors

## 📊 **Performance Testing**

### **Load Times**
- [ ] Initial wallet connection < 3 seconds
- [ ] NFT verification < 5 seconds
- [ ] Tier updates instant after verification
- [ ] No UI freezing during verification

### **Caching**
- [ ] Avoid redundant blockchain calls
- [ ] Cache verification results appropriately
- [ ] Efficient re-verification on reconnect

## 🎯 **Production Readiness**

### **Before Real Contract Deployment**

**Configuration Updates:**
```bash
# Update .env with real contract addresses
NEXT_PUBLIC_GENESIS_NFT_ADDRESS="0x[REAL_GENESIS_CONTRACT]"
NEXT_PUBLIC_MAIN_COLLECTION_ADDRESS="0x[REAL_MAIN_CONTRACT]"

# Disable mock mode
NEXT_PUBLIC_USE_MOCK_NFTS="false"

# Production API keys
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="[REAL_PROJECT_ID]"
NEXT_PUBLIC_ALCHEMY_API_KEY="[REAL_API_KEY]"
```

**Testing Checklist:**
- [ ] Test with real NFT holders
- [ ] Verify contract addresses correct
- [ ] Test on both Ethereum and Polygon
- [ ] Confirm Token ID ranges accurate
- [ ] Load test with multiple users

---

## 🎉 **Demo Script for Stakeholders**

### **5-Minute Demo Flow:**

1. **Standard User Experience**
   - Show someone without NFTs (55% tier)
   - Create post → Show earnings calculation

2. **NFT Holder Upgrade**
   - Connect wallet with NFTs
   - Watch automatic tier upgrade
   - Show increased earnings rate

3. **Token ID Specificity**
   - Display exact Token IDs owned
   - Explain tier assignment logic
   - Show upgrade path to higher tiers

4. **Multi-NFT Priority**
   - Demo wallet with multiple NFT tiers
   - Show highest tier selection
   - Explain Genesis priority system

**Key Message**: *"Contentlynk automatically detects your exact NFT holdings and assigns the highest tier you qualify for - no manual verification needed!"*

---

**🔥 The Token ID-based system is now ready for comprehensive testing!**