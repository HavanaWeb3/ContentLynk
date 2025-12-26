'use client'

import { useEffect, useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useSession } from 'next-auth/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { performNFTVerification, updateUserMembershipTier, NFTHoldings, getTierDisplayInfo } from '@/lib/nftVerification'
import { MembershipTier } from '@/types/membership'
import { toast } from 'react-hot-toast'

interface WalletConnectionProps {
  onMembershipUpdate?: (holdings: NFTHoldings) => void
  showFullCard?: boolean
}

export function WalletConnection({ onMembershipUpdate, showFullCard = true }: WalletConnectionProps) {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: session } = useSession()
  const [isVerifying, setIsVerifying] = useState(false)
  const [nftHoldings, setNftHoldings] = useState<NFTHoldings | null>(null)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [userWalletAddress, setUserWalletAddress] = useState<string | null>(null)

  // Fetch user's stored wallet address and validate on mount and session change
  useEffect(() => {
    const validateWallet = async () => {
      if (session?.user?.id) {
        try {
          const res = await fetch('/api/user/profile')
          const data = await res.json()
          const storedWallet = data.user?.walletAddress || null

          setUserWalletAddress(storedWallet)

          // Immediately disconnect if wallet doesn't match
          if (isConnected && address && storedWallet) {
            if (address.toLowerCase() !== storedWallet.toLowerCase()) {
              console.log('⚠️ Wallet mismatch detected on mount - disconnecting')
              disconnect()
              setNftHoldings(null)
              toast.error('Wallet disconnected: This wallet belongs to a different account')
            }
          } else if (isConnected && address && !storedWallet) {
            // User has no stored wallet but wagmi shows connected - this is from another user
            console.log('⚠️ Connected wallet found but user has no stored wallet - disconnecting')
            disconnect()
            setNftHoldings(null)
            toast.error('Wallet disconnected: No wallet associated with this account')
          }
        } catch (err) {
          console.error('Error fetching user wallet:', err)
        }
      } else {
        // User logged out, clear wallet state and disconnect
        setUserWalletAddress(null)
        if (isConnected) {
          console.log('⚠️ No session but wallet connected - disconnecting')
          disconnect()
          setNftHoldings(null)
        }
      }
    }

    validateWallet()
  }, [session?.user?.id, isConnected, address, disconnect])

  // Additional check when connection state changes
  useEffect(() => {
    if (isConnected && address && userWalletAddress) {
      // If connected wallet doesn't match user's stored wallet, disconnect
      if (address.toLowerCase() !== userWalletAddress.toLowerCase()) {
        console.log('⚠️ Wallet mismatch detected - disconnecting')
        disconnect()
        setNftHoldings(null)
        toast.error('Wallet disconnected: This wallet belongs to a different account')
      }
    }
  }, [isConnected, address, userWalletAddress, disconnect])

  // Verify NFT holdings when wallet connects
  useEffect(() => {
    if (isConnected && address && session?.user?.id) {
      handleNFTVerification()
    }
  }, [isConnected, address, session?.user?.id])

  const handleNFTVerification = async () => {
    if (!address || !session?.user?.id) return

    setIsVerifying(true)
    setVerificationError(null)

    try {
      toast.loading('Verifying NFT holdings and Token IDs...', { id: 'nft-verification' })

      // Use new Token ID-based verification system
      const holdings = await performNFTVerification(address)
      setNftHoldings(holdings)

      // Update user's membership tier in database
      await updateUserMembershipTier(session.user.id, address, holdings)

      // Call callback if provided
      onMembershipUpdate?.(holdings)

      // Show detailed success message with Token IDs
      let successMessage = `Membership verified! You're now ${holdings.membershipTier} tier (${holdings.revenueSharePercentage}% revenue share)`

      if (holdings.genesisTokens.length > 0) {
        successMessage += `\n👑 Genesis NFTs: #${holdings.genesisTokens.join(', #')}`
      }
      if (holdings.mainCollectionTokens.length > 0) {
        successMessage += `\n🎨 Main Collection: #${holdings.mainCollectionTokens.join(', #')}`
      }

      toast.success(successMessage, { id: 'nft-verification', duration: 6000 })
    } catch (error) {
      console.error('NFT verification failed:', error)
      setVerificationError('Failed to verify NFT holdings. Please try again.')
      toast.error('Failed to verify NFT holdings', { id: 'nft-verification' })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setNftHoldings(null)
    setVerificationError(null)
    toast.success('Wallet disconnected')
  }

  if (!showFullCard) {
    return (
      <div className="flex items-center space-x-4">
        <ConnectButton
          accountStatus={{
            smallScreen: 'avatar',
            largeScreen: 'full',
          }}
          chainStatus={{
            smallScreen: 'icon',
            largeScreen: 'full',
          }}
          showBalance={{
            smallScreen: false,
            largeScreen: true,
          }}
        />
        {isConnected && nftHoldings && (
          <Badge className={nftHoldings.tierDetails.color}>
            {nftHoldings.tierDetails.emoji} {nftHoldings.membershipTier} ({nftHoldings.revenueSharePercentage}%)
          </Badge>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Web3 Wallet & NFT Verification</span>
          {nftHoldings && (
            <Badge className={nftHoldings.tierDetails.color}>
              {nftHoldings.tierDetails.emoji} {nftHoldings.membershipTier}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Connect your wallet to verify Havana Elephant NFT holdings and unlock higher revenue shares
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Connect your wallet to automatically verify your Havana Elephant NFT holdings and get your membership tier.
            </p>
            <ConnectButton />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Connected Wallet Info */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="text-sm font-medium text-green-800">Wallet Connected</p>
                <p className="text-xs text-green-600 font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>

            {/* NFT Holdings Display */}
            {isVerifying ? (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-blue-800">Verifying NFT holdings and Token IDs...</p>
                </div>
              </div>
            ) : nftHoldings ? (
              <div className="space-y-3">
                <div className={`p-4 rounded-lg border ${
                  nftHoldings.membershipTier === MembershipTier.GENESIS
                    ? 'bg-indigo-50 border-indigo-200'
                    : nftHoldings.membershipTier === MembershipTier.PLATINUM
                    ? 'bg-purple-50 border-purple-200'
                    : nftHoldings.membershipTier === MembershipTier.GOLD
                    ? 'bg-yellow-50 border-yellow-200'
                    : nftHoldings.membershipTier === MembershipTier.SILVER
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {nftHoldings.tierDetails.emoji} {nftHoldings.membershipTier} Member
                    </h3>
                    <Badge className={nftHoldings.tierDetails.color}>
                      {nftHoldings.revenueSharePercentage}% Revenue Share
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{nftHoldings.tierDetails.description}</p>

                  {/* NFT Holdings Details */}
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    {/* Genesis NFTs */}
                    <div className="bg-white/70 p-3 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-700">👑 Genesis Collection</span>
                        <span className="font-semibold">{nftHoldings.nftCount.genesis}</span>
                      </div>
                      {nftHoldings.genesisTokens.length > 0 ? (
                        <p className="text-xs text-gray-500">Token IDs: #{nftHoldings.genesisTokens.join(', #')}</p>
                      ) : (
                        <p className="text-xs text-gray-400">None owned</p>
                      )}
                    </div>

                    {/* Main Collection NFTs */}
                    <div className="bg-white/70 p-3 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-700">🎨 Main Collection</span>
                        <span className="font-semibold">{nftHoldings.nftCount.mainCollection}</span>
                      </div>
                      {nftHoldings.mainCollectionTokens.length > 0 ? (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Token IDs: #{nftHoldings.mainCollectionTokens.join(', #')}</p>
                          <div className="text-xs text-gray-400">
                            Silver: #1-2970 | Gold: #2971-7920 | Platinum: #7921-9900
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">None owned</p>
                      )}
                    </div>
                  </div>

                  {/* Upgrade Hint */}
                  {getTierDisplayInfo(nftHoldings.membershipTier).upgradeHint && (
                    <div className="mt-3 p-2 bg-white/50 rounded text-xs text-gray-600">
                      💡 {getTierDisplayInfo(nftHoldings.membershipTier).upgradeHint}
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNFTVerification}
                  disabled={isVerifying}
                  className="w-full"
                >
                  Re-verify Holdings
                </Button>
              </div>
            ) : verificationError ? (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-800 mb-2">{verificationError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNFTVerification}
                  disabled={isVerifying}
                >
                  Retry Verification
                </Button>
              </div>
            ) : null}

            {/* Membership Tiers Reference */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Membership Tiers</h4>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex justify-between items-center">
                  <span>👑 Genesis (Any Genesis NFT):</span>
                  <span className="font-bold text-indigo-600">75% revenue share</span>
                </div>
                <div className="flex justify-between">
                  <span>💎 Platinum (#7921-9900):</span>
                  <span className="font-medium">70% revenue share</span>
                </div>
                <div className="flex justify-between">
                  <span>🏆 Gold (#2971-7920):</span>
                  <span className="font-medium">65% revenue share</span>
                </div>
                <div className="flex justify-between">
                  <span>🥈 Silver (#1-2970):</span>
                  <span className="font-medium">60% revenue share</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>⭐ Standard (No NFTs):</span>
                  <span className="font-medium">55% revenue share</span>
                </div>
              </div>
            </div>

            {/* Test Wallets (Development Mode) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">🧪 Test Wallets (Dev Mode)</h4>
                <div className="text-xs text-yellow-700 space-y-1">
                  <p><strong>Genesis:</strong> 0x1111...1111 (has Genesis #42)</p>
                  <p><strong>Platinum:</strong> 0x2222...2222 (has token #8500)</p>
                  <p><strong>Gold:</strong> 0x3333...3333 (has token #5000)</p>
                  <p><strong>Silver:</strong> 0x4444...4444 (has token #1500)</p>
                  <p><strong>Mixed:</strong> 0x6666...6666 (has #1000, #5000, #8500)</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}