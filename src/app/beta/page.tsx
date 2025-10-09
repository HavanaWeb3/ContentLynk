'use client'

import Link from 'next/link'
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
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              🐘 Contentlynk
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
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/20 backdrop-blur-md px-6 py-2 rounded-full text-sm font-semibold mb-6">
            🎯 LIMITED: 100 Beta Creator Spots
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            🐘 Get Paid For Your Content<br />From Day One
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-95">
            55-75% revenue share • Zero follower minimums • Instant earnings
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#apply">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 text-lg">
                Apply for Beta Access
              </Button>
            </a>
            <Link href="/earnings-calculator">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                Calculate Your Earnings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-md text-center">
              <div className="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">100</div>
              <div className="text-gray-600 text-lg">Beta Creator Spots</div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md text-center">
              <div className="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">55-75%</div>
              <div className="text-gray-600 text-lg">Revenue Share</div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md text-center">
              <div className="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">$0</div>
              <div className="text-gray-600 text-lg">Follower Minimum</div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md text-center">
              <div className="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">Q2 2026</div>
              <div className="text-gray-600 text-lg">Beta Launch</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Why Join Contentlynk Beta?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '🚀', title: 'No Gatekeeping', description: 'Start earning from your very first post. No follower minimums, no view requirements, no waiting periods.' },
              { icon: '💰', title: 'Fair Revenue Sharing', description: 'Earn 55-75% of platform revenue based on your tier - up to 15x more than traditional platforms.' },
              { icon: '🎯', title: 'Quality Over Quantity', description: 'Our algorithm rewards meaningful engagement. Comments and shares count 5-20x more than likes.' },
              { icon: '💎', title: 'NFT Bonuses', description: 'Creator Pass NFT holders earn an additional 50% bonus on all content. Be a founding member.' },
              { icon: '🔒', title: 'Transparent Payments', description: 'Blockchain-verified earnings with real-time analytics. You\'ll always know exactly what you\'re earning.' },
              { icon: '🎨', title: 'You Own Your Content', description: 'Complete content ownership with governance rights. Help shape the platform\'s future.' }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Traditional Platforms vs Contentlynk</h2>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-indigo-600 text-white">
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
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-4 px-6 font-medium">{row.feature}</td>
                    <td className="py-4 px-6 text-gray-600">{row.traditional}</td>
                    <td className={`py-4 px-6 font-bold ${row.highlight ? 'text-green-600 bg-green-50' : 'text-indigo-600'}`}>
                      {row.contentlynk}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Earnings Calculator CTA */}
      <section className="py-16 px-4 text-center bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <h2 className="text-4xl font-bold mb-4">See What You Could Earn</h2>
        <p className="text-xl mb-8 opacity-95">
          Calculate your potential monthly earnings based on your typical engagement
        </p>
        <Link href="/earnings-calculator">
          <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 text-lg">
            Try Earnings Calculator →
          </Button>
        </Link>
      </section>

      {/* Beta Application Section */}
      <section id="apply" className="py-16 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Apply for Beta Access</h2>
          <p className="text-xl text-center mb-8 opacity-95">
            Be among the first 100 creators to shape the future of fair creator compensation
          </p>

          <form onSubmit={handleSubmit} className="bg-white text-gray-900 p-8 rounded-2xl shadow-xl">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Current Platform(s) *</label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                <label className="block text-sm font-semibold mb-2">Content Niche *</label>
                <input
                  type="text"
                  name="niche"
                  value={formData.niche}
                  onChange={handleChange}
                  placeholder="e.g., Fashion, Tech, Lifestyle"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Typical Monthly Posts *</label>
                <input
                  type="number"
                  name="posts"
                  value={formData.posts}
                  onChange={handleChange}
                  placeholder="e.g., 20"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Average Post Engagement *</label>
                <input
                  type="text"
                  name="engagement"
                  value={formData.engagement}
                  onChange={handleChange}
                  placeholder="e.g., 500 likes, 50 comments"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Why do you want to join Contentlynk beta? *</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                ></textarea>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 text-lg font-semibold hover:from-indigo-700 hover:to-purple-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Beta Application'}
              </Button>

              {message && (
                <div className={`p-4 rounded-lg ${message.includes('Thank you') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {message}
                </div>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'When does beta launch?',
                a: 'We\'re planning beta launch for Q2 2026. The first 100 approved creators will get early access and founding member benefits.'
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
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-indigo-600 mb-3">{faq.q}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-4">&copy; 2025 Havana Elephant Brand • Contentlynk</p>
          <div className="flex justify-center space-x-6">
            <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
            <Link href="/earnings-calculator" className="hover:text-indigo-400 transition-colors">Calculator</Link>
            <a href="mailto:beta@havanaelephant.com" className="hover:text-indigo-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
