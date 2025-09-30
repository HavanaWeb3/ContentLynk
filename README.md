# Contentlynk - Phase 1 MVP

> The first social platform that pays creators from day one. Zero follower minimums, transparent earnings, powered by $HVNA tokens.

## 🎯 Project Overview

Contentlynk is a revolutionary creator-focused social platform launching as part of the Havana Elephant Brand Web3 ecosystem. Unlike traditional platforms that require thousands of followers before creators can monetize, Contentlynk pays creators 55-75% revenue share in $HVNA tokens starting from their very first post.

### Core Problem We're Solving
- Instagram, TikTok, YouTube require 1K-10K+ followers before monetization
- Creators work for free until they hit arbitrary thresholds
- Low revenue shares (0-5%) on traditional platforms
- Opaque earnings and delayed payments

### Our Solution
- ✅ **Zero follower minimums** - earn from day one
- ✅ **55-75% revenue share** - highest in the industry
- ✅ **Transparent earnings** - real-time $HVNA tracking
- ✅ **NFT membership tiers** - premium rates for community members
- ✅ **Direct wallet payments** - Web3 native payouts

## 🚀 Phase 1 Features (Current MVP)

### ✅ Completed Features
- [x] Next.js 14 + TypeScript foundation
- [x] PostgreSQL database with Prisma ORM
- [x] NextAuth.js authentication system
- [x] User registration and profile creation
- [x] Responsive UI with Tailwind CSS
- [x] Landing page with value proposition
- [x] Creator dashboard with earnings overview
- [x] Content creation interface
- [x] Membership tier system

### 🔄 In Development
- [ ] Web3 wallet integration (MetaMask, WalletConnect, Rabby, Coinbase)
- [ ] NFT membership verification system
- [ ] Real-time earnings calculation
- [ ] Content feed and social features
- [ ] Image upload functionality
- [ ] Engagement tracking (views, likes, comments, shares)

### 📋 Upcoming Features
- [ ] $HVNA token integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Creator monetization tools
- [ ] Brand partnership marketplace

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **NextAuth.js** - Authentication solution

### Backend
- **PostgreSQL** - Primary database
- **Prisma ORM** - Type-safe database client
- **Next.js API Routes** - Serverless functions

### Web3 Integration
- **Wagmi** - React hooks for Ethereum
- **Viem** - Lightweight Ethereum library
- **WalletConnect** - Multi-wallet support

### Deployment
- **Vercel** - Frontend hosting
- **PlanetScale** - Database hosting (production)
- **Cloudinary** - Image storage and optimization

## 🏗 Project Structure

```
contentlynk/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Creator dashboard
│   │   ├── create/            # Content creation
│   │   ├── api/               # API routes
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable UI components
│   │   └── ui/                # Base UI components
│   └── lib/                   # Utility functions
├── prisma/                    # Database schema and migrations
├── public/                    # Static assets
└── package.json              # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   cd contentlynk
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/contentlynk_dev"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### Core Models

#### User
- Authentication and profile information
- Wallet address linking
- Membership tier tracking
- Total earnings accumulation

#### Post
- Content creation and management
- Engagement metrics (views, likes, comments, shares)
- Earnings per post tracking

#### Earning
- Detailed earnings history
- Multiple earning sources (views, tips, partnerships)
- Blockchain transaction tracking

#### Membership Tiers
- **Standard (55%)** - No NFT required
- **Silver (60%)** - Silver tier NFTs
- **Gold (65%)** - Gold tier NFTs
- **Platinum (70%)** - Platinum tier NFTs
- **Genesis (75%)** - Genesis NFTs

## 🎨 Design System

### Color Palette
- **Primary**: Indigo (600, 700, 800)
- **Secondary**: Gray (50-900)
- **Accent**: Purple, Green for earnings
- **Brand**: Havana Elephant color scheme integration

### Typography
- **Font**: Inter (Google Fonts)
- **Scales**: Tailwind default scale
- **Weights**: 400, 500, 600, 700, 800

### Components
- Reusable UI components in `/src/components/ui/`
- Consistent styling with Tailwind CSS
- Mobile-first responsive design

## 🔗 Integration with Havana Elephant Ecosystem

### NFT Integration
- Genesis NFT holders get 75% revenue share
- Main collection holders get tiered benefits
- Automatic tier verification via wallet connection

### $HVNA Token
- Primary payment currency for creator earnings
- Real-time balance tracking
- Direct wallet payments

### Brand Alignment
- Consistent visual identity with Havana Elephant
- Shared community and values
- Cross-platform promotion opportunities

## 🚀 Deployment

### Development Environment
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Database Management
```bash
npx prisma db push      # Push schema changes
npx prisma migrate dev  # Create and apply migrations
npx prisma studio      # Open database GUI
npx prisma generate    # Generate Prisma client
```

### Production Deployment
1. Set up PostgreSQL database (PlanetScale recommended)
2. Configure environment variables
3. Deploy to Vercel or similar platform
4. Run database migrations

## 📈 Success Metrics (Phase 1)

### Technical Goals
- [ ] 50+ beta users can sign up successfully
- [ ] NFT holders get correct membership tiers
- [ ] Content posting works smoothly
- [ ] Earnings tracking displays correctly
- [ ] Mobile responsive design
- [ ] Zero critical bugs

### Business Goals
- Prove the concept: creators earning money immediately
- Validate zero-barrier entry model
- Demonstrate higher revenue share value
- Build initial creator community

## 🗺 Roadmap

### Phase 1 (Current) - Q1 2024
- ✅ Core MVP development
- ✅ Basic social features
- 🔄 Web3 wallet integration
- 🔄 NFT membership verification

### Phase 2 - Q2 2024
- Advanced creator tools
- Brand partnership marketplace
- Enhanced analytics
- Mobile app development

### Phase 3 - Q3 2024
- Full $HVNA token integration
- Advanced monetization features
- Creator fund and incentives
- Scale to 1000+ creators

### Phase 4 - Q4 2024
- Global launch
- Advanced Web3 features
- Cross-platform integrations
- Creator economy expansion

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use Prettier for code formatting
3. Write meaningful commit messages
4. Test thoroughly before submitting PRs

### Getting Help
- Join our Discord community
- Check the documentation
- Submit issues on GitHub
- Contact the development team

## 📄 License

This project is proprietary software developed for the Havana Elephant Brand ecosystem.

## 🙏 Acknowledgments

- Havana Elephant Brand team
- Web3 developer community
- Early beta testers and creators
- NextAuth.js, Prisma, and Tailwind CSS teams

---

**Built with ❤️ for creators by the Havana Elephant team**

*Contentlynk - Where creators earn from day one.*