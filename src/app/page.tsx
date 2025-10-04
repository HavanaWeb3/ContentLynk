'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Contentlynk</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/earnings-calculator">
                <Button variant="ghost">📊 Earnings Calculator</Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Creator Economy
            <span className="block text-indigo-600">Reimagined</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The first social platform that pays creators from day one. Zero follower minimums,
            transparent earnings, powered by $HVNA tokens.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 px-8 py-4 text-lg">
                Start Earning Today
              </Button>
            </Link>
            <Link href="/earnings-calculator">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                📊 Calculate Your Earnings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Creators Choose Contentlynk
            </h2>
            <p className="text-xl text-gray-600">
              Break free from the follower requirements that hold you back
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <CardTitle className="text-2xl mb-4">Zero Barrier Entry</CardTitle>
                <CardDescription className="text-base">
                  Start earning from your very first post. No 1K, 10K, or 100K follower requirements.
                  Your content has value from day one.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center p-8">
              <CardHeader>
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <CardTitle className="text-2xl mb-4">55-75% Revenue Share</CardTitle>
                <CardDescription className="text-base">
                  Earn more than any traditional platform. NFT holders get premium revenue shares
                  up to 75% vs 0-5% elsewhere.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center p-8">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle className="text-2xl mb-4">Instant $HVNA Payments</CardTitle>
                <CardDescription className="text-base">
                  Real-time earnings tracking with direct token payments to your wallet.
                  Watch your earnings grow with every view, like, and share.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to start earning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sign Up & Create</h3>
              <p className="text-gray-600">
                Create your account in seconds. Start posting content immediately - text, images, or both.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Engage & Earn</h3>
              <p className="text-gray-600">
                Every view, like, comment, and share generates $HVNA tokens. Your engagement drives your earnings.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Connect & Withdraw</h3>
              <p className="text-gray-600">
                Connect your Web3 wallet to receive direct token payments. Track everything in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NFT Membership Tiers */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              NFT Membership Tiers
            </h2>
            <p className="text-xl text-gray-600">
              Higher revenue shares for Havana Elephant NFT holders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-gray-600">Standard</CardTitle>
                <div className="text-3xl font-bold text-gray-900">55%</div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">No NFT required</p>
              </CardContent>
            </Card>

            <Card className="text-center border-gray-300">
              <CardHeader>
                <CardTitle className="text-gray-700">Silver</CardTitle>
                <div className="text-3xl font-bold text-gray-800">60%</div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Silver tier NFTs</p>
              </CardContent>
            </Card>

            <Card className="text-center border-yellow-300 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-700">Gold</CardTitle>
                <div className="text-3xl font-bold text-yellow-800">65%</div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-600">Gold tier NFTs</p>
              </CardContent>
            </Card>

            <Card className="text-center border-purple-300 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-700">Platinum</CardTitle>
                <div className="text-3xl font-bold text-purple-800">70%</div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-600">Platinum tier NFTs</p>
              </CardContent>
            </Card>

            <Card className="text-center border-indigo-300 bg-indigo-50">
              <CardHeader>
                <CardTitle className="text-indigo-700">Genesis</CardTitle>
                <div className="text-3xl font-bold text-indigo-800">75%</div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-indigo-600">Genesis NFTs</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join the creator economy revolution. No follower minimums, no waiting periods.
            Start earning from your first post.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 text-lg">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Contentlynk</h3>
              <p className="text-gray-400">
                The creator-first social platform powered by Web3 and $HVNA tokens.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Dashboard</li>
                <li>Create Content</li>
                <li>Earnings</li>
                <li>Feed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Discord</li>
                <li>Twitter</li>
                <li>Telegram</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Contentlynk. Built for the Havana Elephant Web3 ecosystem.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}