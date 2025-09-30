import { readContract } from 'wagmi/actions'
import { wagmiConfig } from '@/lib/web3'
import { MembershipTier } from '@/types/membership'
import {
  NFT_CONTRACTS,
  CHAIN_CONFIGS,
  MOCK_NFT_DATA,
  getTierByTokenId,
  getHighestTier,
  getTierConfig,
  getContractAddresses,
  getRevenueSharePercentage
} from '@/config/nft-contracts'

// ERC721 ABI for essential functions
const ERC721_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'uint256', name: 'index', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// Enhanced NFT Holdings interface with Token ID details
export interface NFTHoldings {
  genesisTokens: number[]
  mainCollectionTokens: number[]
  membershipTier: MembershipTier
  revenueSharePercentage: number
  tierDetails: {
    tier: MembershipTier
    description: string
    emoji: string
    color: string
  }
  nftCount: {
    genesis: number
    mainCollection: number
    total: number
  }
}

/**
 * Check NFT balance and get all token IDs for a contract
 */
async function getNFTTokenIds(
  contractAddress: `0x${string}`,
  walletAddress: `0x${string}`,
  chainId: number
): Promise<number[]> {
  try {
    console.log(`Checking NFTs for contract ${contractAddress} on chain ${chainId}`)

    // First check balance
    const balance = await readContract(wagmiConfig, {
      address: contractAddress,
      abi: ERC721_ABI,
      functionName: 'balanceOf',
      args: [walletAddress],
      chainId,
    })

    const balanceNum = Number(balance)
    console.log(`Balance: ${balanceNum} NFTs`)

    if (balanceNum === 0) {
      return []
    }

    // Get all token IDs owned by the wallet
    const tokenIds: number[] = []
    const maxToFetch = Math.min(balanceNum, 50) // Limit to 50 NFTs for performance

    for (let i = 0; i < maxToFetch; i++) {
      try {
        const tokenId = await readContract(wagmiConfig, {
          address: contractAddress,
          abi: ERC721_ABI,
          functionName: 'tokenOfOwnerByIndex',
          args: [walletAddress, BigInt(i)],
          chainId,
        })
        tokenIds.push(Number(tokenId))
      } catch (error) {
        console.warn(`Could not get token ${i}:`, error)
        // Some contracts might not support tokenOfOwnerByIndex
        break
      }
    }

    console.log(`Found token IDs: ${tokenIds.join(', ')}`)
    return tokenIds
  } catch (error) {
    console.error(`Error checking NFTs for ${contractAddress}:`, error)
    return []
  }
}

/**
 * Determine membership tier based on Token IDs
 */
function calculateMembershipTier(genesisTokens: number[], mainCollectionTokens: number[]): MembershipTier {
  // Priority 1: Genesis NFTs always win (any Genesis NFT = GENESIS tier)
  if (genesisTokens.length > 0) {
    console.log(`User has ${genesisTokens.length} Genesis NFT(s) - GENESIS tier`)
    return MembershipTier.GENESIS
  }

  // Priority 2: Main collection - find highest tier from Token IDs
  if (mainCollectionTokens.length > 0) {
    const tiers: MembershipTier[] = []

    for (const tokenId of mainCollectionTokens) {
      const tierConfig = getTierByTokenId(tokenId)
      if (tierConfig) {
        tiers.push(tierConfig.name)
        console.log(`Token #${tokenId} = ${tierConfig.name} tier`)
      }
    }

    if (tiers.length > 0) {
      const highestTier = getHighestTier(tiers)
      console.log(`Highest tier from main collection: ${highestTier}`)
      return highestTier
    }
  }

  // Priority 3: No NFTs = Standard tier
  console.log('No qualifying NFTs found - STANDARD tier')
  return MembershipTier.STANDARD
}

/**
 * Mock NFT verification for development/testing
 */
export function mockNFTVerification(walletAddress: string): NFTHoldings {
  const address = walletAddress.toLowerCase() as keyof typeof MOCK_NFT_DATA.holdings

  // Check if address is in our mock data
  const mockHoldings = MOCK_NFT_DATA.holdings[address] || { genesis: [], mainCollection: [] }

  const membershipTier = calculateMembershipTier([...mockHoldings.genesis], [...mockHoldings.mainCollection])
  const tierConfig = getTierConfig(membershipTier)
  const revenueSharePercentage = getRevenueSharePercentage(membershipTier)

  console.log(`Mock verification for ${walletAddress}:`, {
    genesis: mockHoldings.genesis,
    mainCollection: mockHoldings.mainCollection,
    tier: membershipTier,
    revenueShare: revenueSharePercentage
  })

  return {
    genesisTokens: [...mockHoldings.genesis],
    mainCollectionTokens: [...mockHoldings.mainCollection],
    membershipTier,
    revenueSharePercentage,
    tierDetails: {
      tier: membershipTier,
      description: tierConfig.description || 'Standard membership',
      emoji: tierConfig.emoji,
      color: tierConfig.color
    },
    nftCount: {
      genesis: mockHoldings.genesis.length,
      mainCollection: mockHoldings.mainCollection.length,
      total: mockHoldings.genesis.length + mockHoldings.mainCollection.length
    }
  }
}

/**
 * Real NFT verification using blockchain contracts
 */
export async function verifyNFTHoldings(walletAddress: `0x${string}`): Promise<NFTHoldings> {
  console.log(`Starting real NFT verification for wallet: ${walletAddress}`)

  const contractAddresses = getContractAddresses()
  let genesisTokens: number[] = []
  let mainCollectionTokens: number[] = []

  try {
    // Check Genesis NFTs on Ethereum Mainnet
    console.log('Checking Genesis NFTs on Ethereum...')
    genesisTokens = await getNFTTokenIds(
      contractAddresses.genesis,
      walletAddress,
      CHAIN_CONFIGS.ethereum.id
    )

    // Check Main Collection NFTs on Polygon
    console.log('Checking Main Collection NFTs on Polygon...')
    mainCollectionTokens = await getNFTTokenIds(
      contractAddresses.mainCollection,
      walletAddress,
      CHAIN_CONFIGS.polygon.id
    )

    // If Main Collection not found on Polygon, also check Ethereum (backup)
    if (mainCollectionTokens.length === 0) {
      console.log('No main collection NFTs on Polygon, checking Ethereum...')
      const ethereumMainTokens = await getNFTTokenIds(
        contractAddresses.mainCollection,
        walletAddress,
        CHAIN_CONFIGS.ethereum.id
      )
      mainCollectionTokens = [...mainCollectionTokens, ...ethereumMainTokens]
    }
  } catch (error) {
    console.error('Error during NFT verification:', error)
  }

  const membershipTier = calculateMembershipTier(genesisTokens, mainCollectionTokens)
  const tierConfig = getTierConfig(membershipTier)
  const revenueSharePercentage = getRevenueSharePercentage(membershipTier)

  console.log('NFT verification complete:', {
    genesis: genesisTokens,
    mainCollection: mainCollectionTokens,
    tier: membershipTier,
    revenueShare: revenueSharePercentage
  })

  return {
    genesisTokens,
    mainCollectionTokens,
    membershipTier,
    revenueSharePercentage,
    tierDetails: {
      tier: membershipTier,
      description: tierConfig.description || 'Standard membership',
      emoji: tierConfig.emoji,
      color: tierConfig.color
    },
    nftCount: {
      genesis: genesisTokens.length,
      mainCollection: mainCollectionTokens.length,
      total: genesisTokens.length + mainCollectionTokens.length
    }
  }
}

/**
 * Main verification function - uses mock or real verification based on environment
 */
export async function performNFTVerification(walletAddress: `0x${string}`): Promise<NFTHoldings> {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const useMockData = isDevelopment || process.env.NEXT_PUBLIC_USE_MOCK_NFTS === 'true'

  if (useMockData) {
    console.log('Using mock NFT verification for development')
    return mockNFTVerification(walletAddress)
  } else {
    console.log('Using real blockchain NFT verification')
    return await verifyNFTHoldings(walletAddress)
  }
}

/**
 * Update user's membership tier in the database
 */
export async function updateUserMembershipTier(
  userId: string,
  walletAddress: string,
  nftHoldings: NFTHoldings
) {
  try {
    const response = await fetch('/api/user/update-membership', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        walletAddress,
        membershipTier: nftHoldings.membershipTier,
        genesisCount: nftHoldings.nftCount.genesis,
        mainCollectionCount: nftHoldings.nftCount.mainCollection,
        genesisTokens: nftHoldings.genesisTokens,
        mainCollectionTokens: nftHoldings.mainCollectionTokens,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to update membership tier')
    }

    const result = await response.json()
    console.log('Membership tier updated successfully:', result)
    return result
  } catch (error) {
    console.error('Error updating membership tier:', error)
    throw error
  }
}

/**
 * Generate detailed tier information for UI display
 */
export function getTierDisplayInfo(tier: MembershipTier) {
  const config = getTierConfig(tier)
  const revenueShare = getRevenueSharePercentage(tier)

  let benefits: string[] = []
  let upgradeHint: string | null = null

  switch (tier) {
    case MembershipTier.GENESIS:
      benefits = [
        'Maximum 75% revenue share',
        'Exclusive Genesis holder status',
        'Priority support',
        'Special community access'
      ]
      break
    case MembershipTier.PLATINUM:
      benefits = [
        '70% revenue share',
        'Premium tier status',
        'Advanced analytics',
        'Priority content review'
      ]
      upgradeHint = 'Own a Genesis NFT to unlock 75% revenue share!'
      break
    case MembershipTier.GOLD:
      benefits = [
        '65% revenue share',
        'Gold tier status',
        'Enhanced earnings',
        'Priority support'
      ]
      upgradeHint = 'Own a Platinum tier NFT (#7921-9900) for 70% revenue share!'
      break
    case MembershipTier.SILVER:
      benefits = [
        '60% revenue share',
        'Silver tier status',
        'Enhanced earnings',
        'Community access'
      ]
      upgradeHint = 'Own a Gold tier NFT (#2971-7920) for 65% revenue share!'
      break
    default:
      benefits = [
        '55% revenue share',
        'Standard membership',
        'Full platform access',
        'Community support'
      ]
      upgradeHint = 'Own a Havana Elephant NFT to unlock higher revenue shares!'
      break
  }

  return {
    tier,
    emoji: config.emoji,
    color: config.color,
    description: config.description || '',
    revenueShare,
    benefits,
    upgradeHint
  }
}