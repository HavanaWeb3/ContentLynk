import { http, createConfig } from 'wagmi'
import { mainnet, polygon, polygonMumbai, sepolia } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

// Configure chains based on environment
const enableTestnets = process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true'
export const chains = [
  mainnet,
  polygon,
  ...(enableTestnets ? [sepolia, polygonMumbai] : []),
] as const

// Create wagmi config using RainbowKit's helper (wagmi v2 compatible)
export const wagmiConfig = getDefaultConfig({
  appName: 'ContentLynk',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: chains as any,
  ssr: true, // Enable server-side rendering support
})

// NFT Contract ABIs
export const ERC721_ABI = [
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

// Contract addresses
export const CONTRACTS = {
  GENESIS_NFT: process.env.NEXT_PUBLIC_GENESIS_NFT_CONTRACT as `0x${string}`,
  MAIN_NFT: process.env.NEXT_PUBLIC_MAIN_NFT_CONTRACT as `0x${string}`,
  HVNA_TOKEN: process.env.NEXT_PUBLIC_HVNA_TOKEN_CONTRACT as `0x${string}`,
} as const

// Network IDs
export const CHAIN_IDS = {
  ETHEREUM: 1,
  POLYGON: 137,
  SEPOLIA: 11155111,
  POLYGON_MUMBAI: 80001,
} as const