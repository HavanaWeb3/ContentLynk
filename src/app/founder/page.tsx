import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export const metadata: Metadata = {
  title: 'Why I Built Contentlynk - Founder David Sime\'s Story',
  description: 'After 4 years earning nothing as a creator, I built Contentlynk - the platform that pays creators 55-75% revenue share from day one, zero follower minimums.',
  openGraph: {
    type: 'article',
    locale: 'en_US',
    url: 'https://contentlynk.com/founder',
    siteName: 'Contentlynk',
    title: 'Why I Built Contentlynk - Founder David Sime\'s Story',
    description: 'After 4 years earning nothing as a creator, I built Contentlynk - the platform that pays creators 55-75% revenue share from day one, zero follower minimums.',
    images: [
      {
        url: '/images/founder/david-founder-large.jpg',
        width: 800,
        height: 533,
        alt: 'David Sime, Founder of Contentlynk, professional headshot',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Why I Built Contentlynk - Founder David Sime\'s Story',
    description: 'After 4 years earning nothing as a creator, I built Contentlynk - the platform that pays creators 55-75% revenue share from day one.',
    images: ['/images/founder/david-founder-large.jpg'],
    creator: '@havanaelephant',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function FounderPage() {
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
      <section className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Photo - Left Column */}
            <div className="order-2 lg:order-1 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-warm opacity-20 blur-3xl"></div>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-havana-cyan/30 hover:border-havana-cyan/60 transition-all duration-300">
                  <Image
                    src="/images/founder/david-founder-large.jpg"
                    alt="David Sime, Founder of Contentlynk, professional headshot"
                    width={800}
                    height={533}
                    className="object-cover w-full"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Content - Right Column */}
            <div className="order-1 lg:order-2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                The Creator Who Earned{' '}
                <span className="bg-gradient-to-r from-havana-pink to-havana-orange bg-clip-text text-transparent">
                  Nothing
                </span>
                <span className="block mt-2">
                  Until I Built the Solution
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-havana-cyan-light mb-8 leading-relaxed">
                Why I spent 4 years creating content for free, then built Contentlynk to fix the broken system
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-gradient-warm hover:shadow-lg hover:shadow-havana-pink/50 px-8 py-4 text-lg font-bold transition-all w-full sm:w-auto">
                    Join Beta Waitlist
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content - 2/3 width */}
            <div className="lg:col-span-2 space-y-12">

              {/* Section 1: The Creator Who Earned Nothing */}
              <div className="prose prose-invert prose-lg max-w-none">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 border-b-2 border-havana-cyan/30 pb-4">
                  The Creator Who Earned Nothing - Until I Built the Solution
                </h2>
                <div className="text-havana-cyan-light space-y-4 text-lg leading-relaxed">
                  <p>
                    For over four years, I've posted content regularly across multiple platforms. I've spent hundreds of hours creating. Some of my content has gone viral. My earnings?{' '}
                    <span className="text-havana-pink font-bold">Zero dollars. Zero euros. Nothing.</span>
                  </p>
                  <p>
                    And it gets worse: I don't even <span className="text-white font-semibold">own</span> the content I created. The platforms do.
                  </p>
                </div>
              </div>

              {/* Section 2: The Book That Changed Everything */}
              <div className="prose prose-invert prose-lg max-w-none">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 border-b-2 border-havana-orange/30 pb-4">
                  The Book That Changed Everything
                </h2>
                <div className="text-havana-cyan-light space-y-4 text-lg leading-relaxed">
                  <p>
                    After reading "Number Going Up" by Zeke Faux - another crypto-bashing book focusing on scams and scandals - I got frustrated. Yes, there are bad actors in crypto. But what about the <span className="text-havana-orange font-semibold">immense opportunities</span> blockchain technology offers to fix broken systems?
                  </p>
                  <p>
                    I'd already written three books: "Crypto Made Simple" (my first imperfect attempt), "100 NFTs for $1" (about buying NFTs affordably), and just published "Digital Ownership Revolution" about using blockchain to benefit the wider community.
                  </p>
                  <p className="text-xl text-white font-semibold bg-havana-navy-light/60 border-l-4 border-havana-cyan p-6 rounded-r-lg">
                    Then I realized: If I wrote a book called "Digital Ownership Revolution," shouldn't I actually build what I'm preaching?
                  </p>
                </div>
              </div>

              {/* Section 3: The Problem Is Real */}
              <div className="prose prose-invert prose-lg max-w-none">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 border-b-2 border-havana-pink/30 pb-4">
                  The Problem Is Real, Personal, and Fixable
                </h2>
                <div className="text-havana-cyan-light space-y-4 text-lg leading-relaxed">
                  <p>
                    I don't know struggling writers personally, but I see their posts constantly - talented creators unable to make a living from their work. The current system is arguably a rip-off:
                  </p>
                  <Card className="bg-havana-navy-light/60 border-2 border-havana-pink/30 backdrop-blur-md">
                    <CardContent className="pt-6">
                      <ul className="space-y-3 text-havana-cyan-light">
                        <li className="flex items-start">
                          <span className="text-havana-pink mr-3 font-bold">•</span>
                          <span><span className="font-semibold text-white">Instagram:</span> $0 direct revenue</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-havana-pink mr-3 font-bold">•</span>
                          <span><span className="font-semibold text-white">TikTok:</span> Maybe 2% if you hit 10K followers</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-havana-pink mr-3 font-bold">•</span>
                          <span><span className="font-semibold text-white">YouTube:</span> 45% after meeting impossible barriers</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-havana-pink mr-3 font-bold">•</span>
                          <span><span className="font-semibold text-white">Facebook:</span> 5% average, invitation only</span>
                        </li>
                      </ul>
                      <p className="mt-6 text-center text-lg font-semibold text-havana-orange">
                        Meanwhile, these platforms are worth billions, built entirely on creator content.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Pull Quote */}
              <div className="bg-gradient-warm p-8 md:p-12 rounded-2xl shadow-2xl border-2 border-havana-orange/50 my-12">
                <p className="text-2xl md:text-4xl font-bold text-white text-center leading-tight">
                  "55-75% of revenue, from day one, zero barriers"
                </p>
              </div>

              {/* Section 4: Fair Day's Pay */}
              <div className="prose prose-invert prose-lg max-w-none">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 border-b-2 border-havana-purple/30 pb-4">
                  Why "Fair Day's Pay for Fair Day's Work" Matters
                </h2>
                <div className="text-havana-cyan-light space-y-4 text-lg leading-relaxed">
                  <p>
                    I heard that expression when I was young, and it stuck with me. It's not complicated: if you create value, you should be paid fairly for it. Not 0-5%. Not after hitting arbitrary follower minimums.{' '}
                    <span className="text-havana-cyan font-bold text-xl">55-75% of revenue, from day one, zero barriers.</span>
                  </p>
                </div>
              </div>

              {/* Section 5: Global Access */}
              <div className="prose prose-invert prose-lg max-w-none">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 border-b-2 border-havana-cyan/30 pb-4">
                  Why Global Access Matters
                </h2>
                <div className="text-havana-cyan-light space-y-4 text-lg leading-relaxed">
                  <p>
                    Living in the UK, Russia, and now Croatia showed me we're all the same people with vastly different opportunities. That's why Contentlynk is designed for creators <span className="text-white font-semibold">anywhere</span> in the world - your earnings go directly into your owned and controlled crypto wallet. No geographic restrictions. No Western rich-country high minimums.
                  </p>
                  <p>
                    I even set the minimum $HVNA token purchase at €10 so as many people as possible can participate.
                  </p>
                </div>
              </div>

              {/* Section 6: Philosophy */}
              <div className="prose prose-invert prose-lg max-w-none">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 border-b-2 border-havana-orange/30 pb-4">
                  The Philosophy Behind It All
                </h2>
                <div className="text-havana-cyan-light space-y-4 text-lg leading-relaxed">
                  <p>
                    My father died at 48 from a heart attack. My uncle (his brother) died at 42 from cancer. I learned early: you never know when your time is up, so get out there and live. That urgency drives everything I build.
                  </p>
                  <p className="text-xl text-white font-semibold">
                    Life is too short for creators to work for free while platforms profit billions.
                  </p>
                </div>
              </div>

              {/* Section 7: Not Asking to Fund a Maybe */}
              <div className="prose prose-invert prose-lg max-w-none">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 border-b-2 border-havana-pink/30 pb-4">
                  This Isn't Asking You to Fund a Maybe
                </h2>
                <div className="text-havana-cyan-light space-y-6 text-lg leading-relaxed">
                  <p>
                    Most crypto projects ask for millions to <span className="italic">develop</span> something that might work someday. That's not this.
                  </p>

                  <div className="bg-havana-navy-light/60 border-2 border-havana-cyan/30 rounded-xl p-6 backdrop-blur-md">
                    <h3 className="text-2xl font-bold text-havana-cyan mb-4">What's Already Built:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="text-havana-cyan mr-3 text-xl">✅</span>
                        <span>Proven e-commerce business (Havana Elephant Brand) generating revenue</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-havana-cyan mr-3 text-xl">✅</span>
                        <span>Creator payment smart contracts written and tested</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-havana-cyan mr-3 text-xl">✅</span>
                        <span>Revenue sharing algorithms developed</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-havana-cyan mr-3 text-xl">✅</span>
                        <span>Platform architecture designed and in development</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-havana-cyan mr-3 text-xl">✅</span>
                        <span>Beta version in testing (Q2 2026 launch)</span>
                      </li>
                    </ul>
                  </div>

                  {/* €2.75M Funding Box */}
                  <div className="bg-gradient-warm p-8 rounded-xl shadow-xl">
                    <h3 className="text-2xl font-bold text-white mb-4">What the €2.75M Funds:</h3>
                    <ul className="space-y-3 text-white">
                      <li className="flex items-start">
                        <span className="mr-3 font-bold">•</span>
                        <span><span className="font-bold">Platform Launch & Scaling</span> - Taking Contentlynk from beta to serving thousands of creators</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-3 font-bold">•</span>
                        <span><span className="font-bold">Creator Onboarding</span> - Marketing and support to bring 1,000+ creators in year one</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-3 font-bold">•</span>
                        <span><span className="font-bold">Payment Infrastructure</span> - Ensuring reliable, instant payouts in 50+ countries</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-3 font-bold">•</span>
                        <span><span className="font-bold">Security & Operations</span> - Professional-grade platform security and 24/7 support</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-3 font-bold">•</span>
                        <span><span className="font-bold">Liquidity</span> - Token trading capability so earnings can be converted when needed</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-3 font-bold">•</span>
                        <span><span className="font-bold">Mobile Apps</span> - iOS and Android for creators on the go</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-havana-navy-light/60 border-2 border-havana-purple/30 rounded-xl p-6 backdrop-blur-md">
                    <h3 className="text-2xl font-bold text-havana-purple mb-4">The Critical Difference:</h3>
                    <p className="text-lg">
                      We have a <span className="text-white font-bold">proven track record of execution</span> (working fashion business) and we're building on <span className="text-white font-bold">tested blockchain technology</span> (not experimental). The platform is in development <span className="text-havana-orange font-bold">now</span> with a clear Q2 2026 launch date.
                    </p>
                    <p className="mt-4 text-lg">
                      You're not funding research and development. You're funding the <span className="text-havana-pink font-bold text-xl">market launch and scaling</span> of a platform that's already been built.
                    </p>
                  </div>

                  <div className="bg-havana-navy-light/60 border-2 border-havana-cyan/30 rounded-xl p-6 backdrop-blur-md">
                    <h3 className="text-2xl font-bold text-havana-cyan mb-4">Immediate Value + Future Growth:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="text-havana-cyan mr-3">•</span>
                        <span>Join community now, get governance rights today</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-havana-cyan mr-3">•</span>
                        <span>NFT holders get 10-30% product discounts immediately</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-havana-cyan mr-3">•</span>
                        <span>Early beta access for founding members (Q2 2026)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-havana-cyan mr-3">•</span>
                        <span>Watch your investment grow as creator adoption scales</span>
                      </li>
                    </ul>
                  </div>

                  <p className="text-xl text-white font-semibold text-center">
                    We're not selling dreams. We're selling <span className="text-havana-orange">execution capability with a clear timeline.</span>
                  </p>

                  <p className="text-2xl text-havana-cyan font-bold text-center">
                    Let's fix the creator economy together.
                  </p>
                </div>
              </div>

            </div>

            {/* Credentials Sidebar - 1/3 width */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Card className="bg-havana-navy-light/80 border-2 border-havana-cyan/30 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-2xl text-havana-cyan">About the Founder</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <Image
                        src="/images/founder/david-founder-medium.jpg"
                        alt="David Sime"
                        width={400}
                        height={267}
                        className="rounded-full object-cover w-32 h-32 border-2 border-havana-cyan/50"
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white mb-2">David Sime</h3>
                      <p className="text-havana-orange font-semibold mb-4">Founder</p>
                    </div>
                    <div className="space-y-3 text-havana-cyan-light">
                      <div className="flex items-start">
                        <span className="text-havana-cyan mr-2">•</span>
                        <span>Creator | Author</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-havana-cyan mr-2">•</span>
                        <span>35+ Years Business Experience</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-havana-cyan mr-2">•</span>
                        <span>Chartered Financial Planner</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-havana-cyan mr-2">•</span>
                        <span>Author: "Digital Ownership Revolution"</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-havana-cyan mr-2">•</span>
                        <span>Based in Dubrovnik, Croatia</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-havana-cyan/20">
                      <a
                        href="https://www.linkedin.com/in/davidsime"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-havana-cyan hover:text-havana-cyan-light transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                        <span>Connect on LinkedIn</span>
                      </a>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats Card */}
                <Card className="bg-gradient-warm border-2 border-havana-orange/50">
                  <CardContent className="pt-6 space-y-4 text-white text-center">
                    <div>
                      <div className="text-4xl font-bold mb-2">4+</div>
                      <div className="text-sm opacity-90">Years Creating Content</div>
                    </div>
                    <div className="border-t border-white/20 pt-4">
                      <div className="text-4xl font-bold mb-2">$0</div>
                      <div className="text-sm opacity-90">Earned from Platforms</div>
                    </div>
                    <div className="border-t border-white/20 pt-4">
                      <div className="text-4xl font-bold mb-2">55-75%</div>
                      <div className="text-sm opacity-90">Revenue Share on Contentlynk</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-cool relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Join the Creator Revolution?
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Be part of the platform that pays creators fairly. Join the beta waitlist and help us build the future of content creation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-havana-purple hover:bg-havana-navy hover:text-white border-2 border-white hover:border-havana-cyan px-8 py-4 text-lg font-bold transition-all w-full sm:w-auto">
                Join Beta Waitlist
              </Button>
            </Link>
            <a href="https://www.amazon.com/Digital-Ownership-Revolution-Blockchain-Economy/dp/B0DM8YQJXN" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-havana-purple px-8 py-4 text-lg font-bold transition-all w-full sm:w-auto">
                📚 Read Digital Ownership Revolution
              </Button>
            </a>
          </div>
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
              <h4 className="font-semibold mb-4 text-havana-orange">Platform</h4>
              <ul className="space-y-2 text-havana-cyan-light">
                <li><Link href="/dashboard" className="hover:text-havana-cyan transition-colors">Dashboard</Link></li>
                <li><Link href="/" className="hover:text-havana-cyan transition-colors">Create Content</Link></li>
                <li><Link href="/earnings-calculator" className="hover:text-havana-cyan transition-colors">Earnings</Link></li>
                <li><Link href="/" className="hover:text-havana-cyan transition-colors">Feed</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-havana-orange">About</h4>
              <ul className="space-y-2 text-havana-cyan-light">
                <li><Link href="/founder" className="hover:text-havana-pink transition-colors">Why I Built This</Link></li>
                <li><Link href="/" className="hover:text-havana-pink transition-colors">Mission</Link></li>
                <li><Link href="/" className="hover:text-havana-pink transition-colors">Roadmap</Link></li>
                <li><Link href="/" className="hover:text-havana-pink transition-colors">Blog</Link></li>
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
