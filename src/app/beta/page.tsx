'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'

export default function BetaPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    platform: '',
    niche: '',
    posts: '',
    engagement: '',
    reason: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/beta-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(result.message || 'Thank you for applying! We\'ll review your application and get back to you within 48 hours.')
        setFormData({
          name: '',
          email: '',
          platform: '',
          niche: '',
          posts: '',
          engagement: '',
          reason: ''
        })
      } else {
        setMessage(result.error || 'Failed to submit application. Please try again.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      setMessage('Oops! Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-gradient-havana relative">
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
              <span className="text-2xl font-bold bg-gradient-to-r from-havana-cyan to-havana-orange bg-clip-text text-transparent">Contentlynk</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost">Home</Button>
              </Link>
              <Link href="/earnings-calculator">
                <Button variant="ghost">Calculator</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-warm text-white py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Logo */}
          <div className="flex justify-center mb-8 animate-fadeInDown">
            <div className="relative w-32 h-32 md:w-48 md:h-48 transition-transform hover:scale-105 filter drop-shadow-2xl">
              <Image
                src="/images/contentlynk-logo.png"
                alt="Contentlynk - Fair Creator Compensation Platform"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="inline-block bg-white/20 backdrop-blur-md px-6 py-2 rounded-full text-sm font-semibold mb-6">
            🎯 LIMITED: 1,000 Beta Creator Spots
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Get Paid For Your Content<br />From Day One
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-95">
            55-75% revenue share • Zero follower minimums • Instant earnings
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#apply">
              <Button size="lg" className="bg-white text-havana-orange hover:bg-havana-navy hover:text-white border-2 border-white hover:border-havana-cyan px-8 py-4 text-lg font-bold transition-all">
                Apply for Beta Access
              </Button>
            </a>
            <Link href="/earnings-calculator">
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/20 px-8 py-4 text-lg">
                Calculate Your Earnings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-havana-navy-dark/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-havana-navy-light/60 p-8 rounded-2xl shadow-lg border-2 border-havana-cyan/30 text-center backdrop-blur-md hover:border-havana-cyan transition-all">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-havana-cyan to-havana-purple bg-clip-text text-transparent mb-2">1,000</div>
              <div className="text-havana-cyan-light text-lg">Beta Creator Spots</div>
            </div>
            <div className="bg-havana-navy-light/60 p-8 rounded-2xl shadow-lg border-2 border-havana-orange/30 text-center backdrop-blur-md hover:border-havana-orange transition-all">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-havana-orange to-havana-pink bg-clip-text text-transparent mb-2">55-75%</div>
              <div className="text-havana-cyan-light text-lg">Revenue Share</div>
            </div>
            <div className="bg-havana-navy-light/60 p-8 rounded-2xl shadow-lg border-2 border-havana-pink/30 text-center backdrop-blur-md hover:border-havana-pink transition-all">
              <div className="text-4xl md:text-5xl font-bold text-havana-pink mb-2">$0</div>
              <div className="text-havana-cyan-light text-lg">Follower Minimum</div>
            </div>
            <div className="bg-havana-navy-light/60 p-8 rounded-2xl shadow-lg border-2 border-havana-purple/30 text-center backdrop-blur-md hover:border-havana-purple transition-all">
              <div className="text-4xl md:text-5xl font-bold text-havana-purple mb-2">Q2 2026</div>
              <div className="text-havana-cyan-light text-lg">Beta Launch</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">Why Join Contentlynk Beta?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-havana-navy-light/60 p-8 rounded-2xl backdrop-blur-md border-2 border-havana-cyan/30 hover:border-havana-cyan transition-all">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-3 text-white">No Gatekeeping</h3>
              <p className="text-havana-cyan-light leading-relaxed">Start earning from your very first post. No follower minimums, no view requirements, no waiting periods.</p>
            </div>
            <div className="bg-havana-navy-light/60 p-8 rounded-2xl backdrop-blur-md border-2 border-havana-orange/30 hover:border-havana-orange transition-all">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-3 text-white">Fair Revenue Sharing</h3>
              <p className="text-havana-cyan-light leading-relaxed">Earn 55-75% of platform revenue based on your tier - up to 15x more than traditional platforms.</p>
            </div>
            <div className="bg-havana-navy-light/60 p-8 rounded-2xl backdrop-blur-md border-2 border-havana-pink/30 hover:border-havana-pink transition-all">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3 text-white">Quality Over Quantity</h3>
              <p className="text-havana-cyan-light leading-relaxed">Our algorithm rewards meaningful engagement. Comments and shares count 5-20x more than likes.</p>
            </div>
            <div className="bg-havana-navy-light/60 p-8 rounded-2xl backdrop-blur-md border-2 border-havana-purple/30 hover:border-havana-purple transition-all">
              <div className="text-5xl mb-4">💎</div>
              <h3 className="text-xl font-bold mb-3 text-white">NFT Bonuses</h3>
              <p className="text-havana-cyan-light leading-relaxed">Creator Pass NFT holders earn an additional 50% bonus on all content. Be a founding member.</p>
            </div>
            <div className="bg-havana-navy-light/60 p-8 rounded-2xl backdrop-blur-md border-2 border-havana-cyan/30 hover:border-havana-cyan transition-all">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-3 text-white">Transparent Payments</h3>
              <p className="text-havana-cyan-light leading-relaxed">Blockchain-verified earnings with real-time analytics. You'll always know exactly what you're earning.</p>
            </div>
            <div className="bg-havana-navy-light/60 p-8 rounded-2xl backdrop-blur-md border-2 border-havana-orange/30 hover:border-havana-orange transition-all">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-xl font-bold mb-3 text-white">You Own Your Content</h3>
              <p className="text-havana-cyan-light leading-relaxed">Complete content ownership with governance rights. Help shape the platform's future.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 px-4 bg-havana-navy-dark/50 backdrop-blur-sm relative z-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">Traditional Platforms vs Contentlynk</h2>
          <div className="bg-havana-navy-light/60 rounded-2xl shadow-lg overflow-hidden backdrop-blur-md border-2 border-havana-cyan/30">
            <table className="w-full">
              <thead className="bg-gradient-warm text-white">
                <tr>
                  <th className="py-4 px-6 text-left font-semibold">Feature</th>
                  <th className="py-4 px-6 text-left font-semibold">Traditional</th>
                  <th className="py-4 px-6 text-left font-semibold">Contentlynk</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Revenue Share', traditional: '0-5%', contentlynk: '55-75%', highlight: true },
                  { feature: 'Follower Minimum', traditional: '1K - 1M+', contentlynk: 'ZERO', highlight: true },
                  { feature: 'Time to Monetize', traditional: '6-24+ months', contentlynk: 'Day one', highlight: true },
                  { feature: 'Payment Transparency', traditional: 'Opaque algorithms', contentlynk: 'Blockchain verified', highlight: false },
                  { feature: 'Platform Governance', traditional: 'Zero control', contentlynk: 'Community voting', highlight: false },
                  { feature: 'Content Ownership', traditional: 'Platform owns', contentlynk: 'You own', highlight: false }
                ].map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-havana-navy-light/40' : 'bg-havana-navy-dark/40'}>
                    <td className="py-4 px-6 font-medium text-white">{row.feature}</td>
                    <td className="py-4 px-6 text-havana-cyan-light">{row.traditional}</td>
                    <td className={`py-4 px-6 font-bold ${row.highlight ? 'text-havana-cyan bg-havana-cyan/10' : 'text-havana-orange'}`}>
                      {row.contentlynk}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Why 1,000 Creators Section */}
      <section className="py-16 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">🎯 Why 1,000 Creators?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-havana-navy-light/60 p-8 rounded-2xl backdrop-blur-md border-2 border-havana-cyan/30 hover:border-havana-cyan transition-all">
              <h3 className="text-xl font-bold mb-3 text-havana-cyan">Natural Gaming Protection</h3>
              <p className="text-havana-cyan-light leading-relaxed">Scale provides natural gaming protection through economic dilution</p>
            </div>
            <div className="bg-havana-navy-light/60 p-8 rounded-2xl backdrop-blur-md border-2 border-havana-orange/30 hover:border-havana-orange transition-all">
              <h3 className="text-xl font-bold mb-3 text-havana-orange">Real Network Effects</h3>
              <p className="text-havana-cyan-light leading-relaxed">1,000 diverse creators generate real network effects and authentic social dynamics</p>
            </div>
            <div className="bg-havana-navy-light/60 p-8 rounded-2xl backdrop-blur-md border-2 border-havana-pink/30 hover:border-havana-pink transition-all">
              <h3 className="text-xl font-bold mb-3 text-havana-pink">Complete Testing Coverage</h3>
              <p className="text-havana-cyan-light leading-relaxed">Larger pool ensures we test with every creator type and content niche</p>
            </div>
            <div className="bg-havana-navy-light/60 p-8 rounded-2xl backdrop-blur-md border-2 border-havana-purple/30 hover:border-havana-purple transition-all">
              <h3 className="text-xl font-bold mb-3 text-havana-purple">Coordination Resistance</h3>
              <p className="text-havana-cyan-light leading-relaxed">Coordination becomes mathematically impossible with this many participants</p>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Calculator CTA */}
      <section className="py-16 px-4 text-center bg-gradient-warm text-white relative z-10">
        <h2 className="text-4xl font-bold mb-4">See What You Could Earn</h2>
        <p className="text-xl mb-8 opacity-95">
          Calculate your potential monthly earnings based on your typical engagement
        </p>
        <Link href="/earnings-calculator">
          <Button size="lg" className="bg-white text-havana-orange hover:bg-havana-navy hover:text-white border-2 border-white hover:border-havana-cyan px-8 py-4 text-lg font-bold transition-all">
            Try Earnings Calculator →
          </Button>
        </Link>
      </section>

      {/* Beta Application Section */}
      <section id="apply" className="py-16 px-4 bg-gradient-cool text-white relative z-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Apply for Beta Access</h2>
          <p className="text-xl text-center mb-8 opacity-95">
            Be among the first 1,000 creators to shape the future of fair creator compensation
          </p>

          <form onSubmit={handleSubmit} className="bg-havana-navy-light/90 backdrop-blur-md text-white p-8 rounded-2xl shadow-xl border-2 border-havana-cyan/30">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-havana-cyan">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-havana-navy-dark/60 border border-havana-cyan/30 text-white rounded-lg focus:ring-2 focus:ring-havana-cyan focus:border-havana-cyan"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-havana-cyan">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-havana-navy-dark/60 border border-havana-cyan/30 text-white rounded-lg focus:ring-2 focus:ring-havana-cyan focus:border-havana-cyan"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-havana-cyan">Current Platform(s) *</label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-havana-navy-dark/60 border border-havana-cyan/30 text-white rounded-lg focus:ring-2 focus:ring-havana-cyan focus:border-havana-cyan"
                >
                  <option value="">Select primary platform</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="twitter">Twitter/X</option>
                  <option value="facebook">Facebook</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-havana-cyan">Content Niche *</label>
                <input
                  type="text"
                  name="niche"
                  value={formData.niche}
                  onChange={handleChange}
                  placeholder="e.g., Fashion, Tech, Lifestyle"
                  required
                  className="w-full px-4 py-3 bg-havana-navy-dark/60 border border-havana-cyan/30 text-white rounded-lg focus:ring-2 focus:ring-havana-cyan focus:border-havana-cyan placeholder-havana-cyan-light/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-havana-cyan">Typical Monthly Posts *</label>
                <input
                  type="number"
                  name="posts"
                  value={formData.posts}
                  onChange={handleChange}
                  placeholder="e.g., 20"
                  required
                  className="w-full px-4 py-3 bg-havana-navy-dark/60 border border-havana-cyan/30 text-white rounded-lg focus:ring-2 focus:ring-havana-cyan focus:border-havana-cyan placeholder-havana-cyan-light/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-havana-cyan">Average Post Engagement *</label>
                <input
                  type="text"
                  name="engagement"
                  value={formData.engagement}
                  onChange={handleChange}
                  placeholder="e.g., 500 likes, 50 comments"
                  required
                  className="w-full px-4 py-3 bg-havana-navy-dark/60 border border-havana-cyan/30 text-white rounded-lg focus:ring-2 focus:ring-havana-cyan focus:border-havana-cyan placeholder-havana-cyan-light/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-havana-cyan">Why do you want to join Contentlynk beta? *</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="w-full px-4 py-3 bg-havana-navy-dark/60 border border-havana-cyan/30 text-white rounded-lg focus:ring-2 focus:ring-havana-cyan focus:border-havana-cyan"
                ></textarea>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-warm text-white py-3 text-lg font-semibold hover:shadow-lg hover:shadow-havana-pink/50 transition-all"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Beta Application'}
              </Button>

              {message && (
                <div className={`p-4 rounded-lg ${message.includes('Thank you') ? 'bg-havana-cyan/20 text-havana-cyan border-2 border-havana-cyan' : 'bg-havana-pink/20 text-havana-pink border-2 border-havana-pink'}`}>
                  {message}
                </div>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'When does beta launch?',
                a: 'We\'re planning beta launch for Q2 2026. The first 1,000 approved creators will get early access and founding member benefits.'
              },
              {
                q: 'Do I need followers to apply?',
                a: 'No! We\'re looking for quality creators of all sizes. Whether you have 100 or 100K followers, if you create great content, you can earn.'
              },
              {
                q: 'How are earnings calculated?',
                a: 'Earnings are based on a Quality Score (Likes + Comments×5 + Shares×20) multiplied by your tier\'s revenue share percentage. Try our calculator to see your potential earnings.'
              },
              {
                q: 'What are the Creator Pass NFTs?',
                a: 'Creator Pass NFTs give you additional benefits including +50% earnings bonus, governance rights, and exclusive platform features. Beta creators get priority access.'
              },
              {
                q: 'How do I get paid?',
                a: 'Earnings are paid in $HVNA tokens which can be converted to USD. All payments are blockchain-verified for complete transparency.'
              },
              {
                q: 'What happens after beta?',
                a: 'Beta creators become founding members with permanent benefits, including enhanced revenue share, platform governance rights, and exclusive features for life.'
              },
              {
                q: 'Why 1,000 creators instead of a smaller beta?',
                a: 'Larger beta groups prevent coordination and gaming of the reward system through dilution. With 1,000 diverse creators, the platform generates real social dynamics and network effects while making it economically unviable for anyone to game the system. This gives us better data and a more realistic test environment.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-havana-navy-light/60 p-6 rounded-xl backdrop-blur-md border-2 border-havana-cyan/30 hover:border-havana-cyan transition-all">
                <h3 className="text-xl font-bold text-havana-cyan mb-3">{faq.q}</h3>
                <p className="text-havana-cyan-light leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-havana-navy-dark text-white py-12 px-4 relative z-10 border-t border-havana-cyan/20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-4 text-havana-cyan-light">&copy; 2025 Havana Elephant Brand • Contentlynk</p>
          <div className="flex justify-center space-x-6">
            <Link href="/" className="hover:text-havana-cyan transition-colors">Home</Link>
            <Link href="/earnings-calculator" className="hover:text-havana-orange transition-colors">Calculator</Link>
            <a href="mailto:beta@havanaelephant.com" className="hover:text-havana-pink transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
