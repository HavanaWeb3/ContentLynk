import { MembershipTier } from '@/types/membership'

// NFT Contract Configuration
// IMPORTANT: Replace mock addresses with real contract addresses before production deployment

export interface NFTTierConfig {
  name: MembershipTier
  tokenIdStart: number
  tokenIdEnd: number
  revenueShare: number
  color: string
  emoji: string
  description: string
}

export interface GenesisConfig {
  address: `0x${string}`
  chain: 'ethereum'
  tier: MembershipTier.GENESIS
  revenueShare: number
  color: string
  emoji: string
  description: string
}

export interface MainCollectionConfig {
  address: `0x${string}`
  chain: 'polygon'
  tiers: NFTTierConfig[]
}

export const NFT_CONTRACTS = {
  // Genesis Collection (Ethereum Mainnet)
  // 100 NFTs total - Any Genesis NFT = GENESIS tier (75% revenue share)
  genesis: {
    address: '0x1111111111111111111111111111111111111111' as `0x${string}`, // MOCK - Replace with real address
    chain: 'ethereum' as const,
    tier: MembershipTier.GENESIS,
    revenueShare: 0.75,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    emoji: '👑',
    description: 'Genesis Collection holder - Maximum revenue share'
  } as GenesisConfig,

  // Boldly Elephunky Main Collection (Polygon Network)
  // 9,900 NFTs total - Tier based on Token ID ranges
  mainCollection: {
    address: '0x2222222222222222222222222222222222222222' as `0x${string}`, // MOCK - Replace with real address
    chain: 'polygon' as const,
    tiers: [
      {
        name: MembershipTier.PLATINUM,
        tokenIdStart: 7921,
        tokenIdEnd: 9900,
        revenueShare: 0.70,
        color: 'bg-purple-100 text-purple-800 border-purple-300',
        emoji: '💎',
        description: 'Platinum tier - Token IDs #7921-9900'
      },
      {
        name: MembershipTier.GOLD,
        tokenIdStart: 2971,
        tokenIdEnd: 7920,
        revenueShare: 0.65,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        emoji: '🏆',
        description: 'Gold tier - Token IDs #2971-7920'
      },
      {
        name: MembershipTier.SILVER,
        tokenIdStart: 1,
        tokenIdEnd: 2970,
        revenueShare: 0.60,
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        emoji: '🥈',
        description: 'Silver tier - Token IDs #1-2970'
      }
    ]
  } as MainCollectionConfig,

  // Standard tier for users without NFTs
  standard: {
    tier: MembershipTier.STANDARD,
    revenueShare: 0.55,
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    emoji: '⭐',
    description: 'Standard member - No NFTs required'
  }
} as const

// Chain configurations
export const CHAIN_CONFIGS = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
    rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    blockExplorer: 'https://etherscan.io'
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    rpcUrl: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    blockExplorer: 'https://polygonscan.com'
  },
  // Testnets for development
  sepolia: {
    id: 11155111,
    name: 'Sepolia',
    rpcUrl: `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    blockExplorer: 'https://sepolia.etherscan.io'
  },
  mumbai: {
    id: 80001,
    name: 'Mumbai',
    rpcUrl: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    blockExplorer: 'https://mumbai.polygonscan.com'
  }
} as const

// Helper functions for tier detection
export function getTierByTokenId(tokenId: number): NFTTierConfig | null {
  // Check main collection tiers (sorted by highest tier first for priority)
  for (const tier of NFT_CONTRACTS.mainCollection.tiers) {
    if (tokenId >= tier.tokenIdStart && tokenId <= tier.tokenIdEnd) {
      return tier
    }
  }
  return null
}

export function getHighestTier(tiers: MembershipTier[]): MembershipTier {
  // Priority order (highest to lowest)
  const tierPriority = [
    MembershipTier.GENESIS,
    MembershipTier.PLATINUM,
    MembershipTier.GOLD,
    MembershipTier.SILVER,
    MembershipTier.STANDARD
  ]

  for (const tier of tierPriority) {
    if (tiers.includes(tier)) {
      return tier
    }
  }

  return MembershipTier.STANDARD
}

export function getTierConfig(tier: MembershipTier) {
  switch (tier) {
    case MembershipTier.GENESIS:
      return NFT_CONTRACTS.genesis
    case MembershipTier.PLATINUM:
      return NFT_CONTRACTS.mainCollection.tiers.find(t => t.name === MembershipTier.PLATINUM)!
    case MembershipTier.GOLD:
      return NFT_CONTRACTS.mainCollection.tiers.find(t => t.name === MembershipTier.GOLD)!
    case MembershipTier.SILVER:
      return NFT_CONTRACTS.mainCollection.tiers.find(t => t.name === MembershipTier.SILVER)!
    default:
      return NFT_CONTRACTS.standard
  }
}

export function getRevenueSharePercentage(tier: MembershipTier): number {
  const config = getTierConfig(tier)
  return Math.round(config.revenueShare * 100)
}

// Mock NFT data for testing
export const MOCK_NFT_DATA = {
  // Test wallet addresses with different NFT holdings
  testWallets: {
    genesis: '0x1111111111111111111111111111111111111111', // Has Genesis NFT
    platinum: '0x2222222222222222222222222222222222222222', // Has Platinum tier token
    gold: '0x3333333333333333333333333333333333333333', // Has Gold tier token
    silver: '0x4444444444444444444444444444444444444444', // Has Silver tier token
    standard: '0x5555555555555555555555555555555555555555', // No NFTs
    mixed: '0x6666666666666666666666666666666666666666', // Has multiple tiers
  },

  // Mock NFT holdings for each test wallet
  holdings: {
    '0x1111111111111111111111111111111111111111': {
      genesis: [42], // Genesis token #42
      mainCollection: []
    },
    '0x2222222222222222222222222222222222222222': {
      genesis: [],
      mainCollection: [8500] // Platinum tier token
    },
    '0x3333333333333333333333333333333333333333': {
      genesis: [],
      mainCollection: [5000] // Gold tier token
    },
    '0x4444444444444444444444444444444444444444': {
      genesis: [],
      mainCollection: [1500] // Silver tier token
    },
    '0x5555555555555555555555555555555555555555': {
      genesis: [],
      mainCollection: []
    },
    '0x6666666666666666666666666666666666666666': {
      genesis: [],
      mainCollection: [1000, 5000, 8500] // Silver, Gold, Platinum (should get Platinum)
    }
  }
} as const

// Environment-based contract selection
export function getContractAddresses() {
  const isDevelopment = process.env.NODE_ENV === 'development'

  if (isDevelopment) {
    // Use mock addresses for development
    return {
      genesis: NFT_CONTRACTS.genesis.address,
      mainCollection: NFT_CONTRACTS.mainCollection.address
    }
  }

  // Use environment variables for production (when real addresses are available)
  return {
    genesis: (process.env.NEXT_PUBLIC_GENESIS_NFT_ADDRESS as `0x${string}`) || NFT_CONTRACTS.genesis.address,
    mainCollection: (process.env.NEXT_PUBLIC_MAIN_COLLECTION_ADDRESS as `0x${string}`) || NFT_CONTRACTS.mainCollection.address
  }
}