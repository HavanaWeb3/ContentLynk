'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export default function Home() {
  return (
    <div className="min-h-screen relative bg-gradient-havana">
      {/* Navigation */}
      <nav className="bg-havana-navy-light/90 backdrop-blur-md border-b border-havana-cyan/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 transition-transform group-hover:rotate-6">
                <Image
                  src="/images/contentlynk-logo.png"
                  alt="Contentlynk"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-havana-cyan to-havana-orange bg-clip-text text-transparent">Contentlynk</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <a href="https://havanaelephant.com" target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex">
                <Button variant="ghost">🐘 Havana Elephant Ecosystem</Button>
              </a>
              <Link href="/earnings-calculator">
                <Button variant="ghost">📊 Earnings Calculator</Button>
              </Link>
              <Link href="/founder">
                <Button variant="ghost">Why I Built This</Button>
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
          {/* Hero Logo */}
          <div className="flex justify-center mb-8 animate-fadeInDown">
            <div className="relative w-40 h-40 md:w-52 md:h-52 transition-transform hover:scale-105 filter drop-shadow-2xl">
              <Image
                src="/images/contentlynk-logo.png"
                alt="Contentlynk - Creator Economy Reimagined"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Creator Economy
            <span className="block bg-gradient-to-r from-havana-orange via-havana-pink to-havana-purple bg-clip-text text-transparent">Reimagined</span>
          </h1>
          <p className="text-xl md:text-2xl text-havana-cyan-light mb-8 max-w-3xl mx-auto">
            The first social platform that pays creators from day one. Zero follower minimums,
            transparent earnings, powered by $HVNA tokens.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-gradient-warm hover:shadow-lg hover:shadow-havana-pink/50 px-8 py-4 text-lg font-bold transition-all">
                Start Earning Today
              </Button>
            </Link>
            <Link href="/earnings-calculator">
              <Button variant="outline" size="lg" className="border-2 border-havana-cyan text-havana-cyan hover:bg-havana-cyan/20 px-8 py-4 text-lg">
                📊 Calculate Your Earnings
              </Button>
            </Link>
          </div>

          {/* $HVNA Presale CTA */}
          <div className="mt-8 flex justify-center">
            <a
              href="https://presale.havanaelephant.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Button
                size="lg"
                className="px-10 py-5 text-lg font-bold text-white transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-[0_0_40px_rgba(255,107,53,0.6)]"
                style={{
                  background: 'linear-gradient(135deg, #FF6B35 0%, #764ba2 100%)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                💎 Join $HVNA Presale Now
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Creators Choose Contentlynk
            </h2>
            <p className="text-xl text-havana-cyan-light">
              Break free from the follower requirements that hold you back
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 bg-havana-navy-light/60 border-2 border-havana-cyan/30 backdrop-blur-md hover:border-havana-cyan transition-all">
              <CardHeader>
                <div className="w-16 h-16 bg-havana-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-havana-cyan/50">
                  <svg className="w-8 h-8 text-havana-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <CardTitle className="text-2xl mb-4 text-white">Zero Barrier Entry</CardTitle>
                <CardDescription className="text-base text-havana-cyan-light">
                  Start earning from your very first post. No 1K, 10K, or 100K follower requirements.
                  Your content has value from day one.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center p-8 bg-havana-navy-light/60 border-2 border-havana-orange/30 backdrop-blur-md hover:border-havana-orange transition-all">
              <CardHeader>
                <div className="w-16 h-16 bg-havana-orange/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-havana-orange/50">
                  <svg className="w-8 h-8 text-havana-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <CardTitle className="text-2xl mb-4 text-white">55-75% Revenue Share</CardTitle>
                <CardDescription className="text-base text-havana-cyan-light">
                  Earn more than any traditional platform. NFT holders get premium revenue shares
                  up to 75% vs 0-5% elsewhere.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center p-8 bg-havana-navy-light/60 border-2 border-havana-pink/30 backdrop-blur-md hover:border-havana-pink transition-all">
              <CardHeader>
                <div className="w-16 h-16 bg-havana-pink/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-havana-pink/50">
                  <svg className="w-8 h-8 text-havana-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle className="text-2xl mb-4 text-white">Instant $HVNA Payments</CardTitle>
                <CardDescription className="text-base text-havana-cyan-light">
                  Real-time earnings tracking with direct token payments to your wallet.
                  Watch your earnings grow with every view, like, and share.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-havana-navy-dark/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-havana-cyan-light">
              Three simple steps to start earning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-warm rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg shadow-havana-orange/50">
                1
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Sign Up & Create</h3>
              <p className="text-havana-cyan-light">
                Create your account in seconds. Start posting content immediately - text, images, or both.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-warm rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg shadow-havana-pink/50">
                2
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Engage & Earn</h3>
              <p className="text-havana-cyan-light">
                Every view, like, comment, and share generates $HVNA tokens. Your engagement drives your earnings.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-warm rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg shadow-havana-orange/50">
                3
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Connect & Withdraw</h3>
              <p className="text-havana-cyan-light">
                Connect your Web3 wallet to receive direct token payments. Track everything in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NFT Membership Tiers */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              NFT Membership Tiers
            </h2>
            <p className="text-xl text-havana-cyan-light">
              Higher revenue shares for Havana Elephant NFT holders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="text-center bg-havana-navy-light/60 border border-havana-cyan/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-havana-cyan-light">Standard</CardTitle>
                <div className="text-3xl font-bold text-white">55%</div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-havana-cyan-light">No NFT required</p>
              </CardContent>
            </Card>

            <Card className="text-center bg-havana-navy-light/60 border-2 border-gray-400/30 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-gray-300">Silver</CardTitle>
                <div className="text-3xl font-bold text-gray-100">60%</div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300">Silver tier NFTs</p>
              </CardContent>
            </Card>

            <Card className="text-center bg-havana-navy-light/60 border-2 border-havana-orange/50 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-havana-orange">Gold</CardTitle>
                <div className="text-3xl font-bold text-havana-orange-light">65%</div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-havana-orange">Gold tier NFTs</p>
              </CardContent>
            </Card>

            <Card className="text-center bg-havana-navy-light/60 border-2 border-havana-purple/50 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-havana-purple">Platinum</CardTitle>
                <div className="text-3xl font-bold text-havana-purple-light">70%</div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-havana-purple">Platinum tier NFTs</p>
              </CardContent>
            </Card>

            <Card className="text-center bg-havana-navy-light/60 border-2 border-havana-pink/50 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-havana-pink">Genesis</CardTitle>
                <div className="text-3xl font-bold text-havana-pink-light">75%</div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-havana-pink">Genesis NFTs</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-warm relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join the creator economy revolution. No follower minimums, no waiting periods.
            Start earning from your first post.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-white text-havana-orange hover:bg-havana-navy hover:text-white border-2 border-white hover:border-havana-cyan px-8 py-4 text-lg font-bold transition-all">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-havana-navy-dark text-white py-12 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-havana-cyan/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-havana-cyan to-havana-orange bg-clip-text text-transparent">Contentlynk</h3>
              <p className="text-havana-cyan-light">
                The creator-first social platform powered by Web3 and $HVNA tokens.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-havana-orange">Ecosystem</h4>
              <ul className="space-y-2 text-havana-cyan-light">
                <li>
                  <a href="https://havanaelephant.com" target="_blank" rel="noopener noreferrer" className="hover:text-havana-cyan cursor-pointer transition-colors flex items-center gap-2">
                    🐘 Havana Elephant Web3
                  </a>
                </li>
                <li>
                  <a href="https://presale.havanaelephant.com" target="_blank" rel="noopener noreferrer" className="hover:text-havana-cyan cursor-pointer transition-colors">
                    $HVNA Token Presale
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-havana-orange">Platform</h4>
              <ul className="space-y-2 text-havana-cyan-light hover:text-white">
                <li className="hover:text-havana-cyan cursor-pointer transition-colors">Dashboard</li>
                <li className="hover:text-havana-cyan cursor-pointer transition-colors">Create Content</li>
                <li className="hover:text-havana-cyan cursor-pointer transition-colors">Earnings</li>
                <li className="hover:text-havana-cyan cursor-pointer transition-colors">Feed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-havana-orange">About</h4>
              <ul className="space-y-2 text-havana-cyan-light">
                <li><Link href="/founder" className="hover:text-havana-pink cursor-pointer transition-colors">Why I Built This</Link></li>
                <li className="hover:text-havana-pink cursor-pointer transition-colors">Mission</li>
                <li className="hover:text-havana-pink cursor-pointer transition-colors">Roadmap</li>
                <li className="hover:text-havana-pink cursor-pointer transition-colors">Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-havana-orange">Support</h4>
              <ul className="space-y-2 text-havana-cyan-light">
                <li className="hover:text-havana-cyan cursor-pointer transition-colors">Help Center</li>
                <li className="hover:text-havana-cyan cursor-pointer transition-colors">Contact Us</li>
                <li className="hover:text-havana-cyan cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-havana-cyan cursor-pointer transition-colors">Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-havana-cyan/20 mt-8 pt-8 text-center text-havana-cyan-light">
            <p>&copy; 2024 Contentlynk. Built for the Havana Elephant Web3 ecosystem.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}