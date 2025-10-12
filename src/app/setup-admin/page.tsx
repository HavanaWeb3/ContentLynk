'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export default function SetupAdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [secret, setSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/admin/make-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email,
          secret: secret,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('✅ Success! You are now an admin. Please sign out and sign back in.')
        setTimeout(() => {
          router.push('/admin/beta-applications')
        }, 2000)
      } else {
        setError(data.error || 'Failed to make admin')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Setup Admin Access</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to set up admin access.</p>
          <Button onClick={() => router.push('/auth/signin')}>Sign In</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Setup Admin Access</h1>
        <p className="text-sm text-gray-600 mb-6">
          Logged in as: <span className="font-semibold">{session?.user?.email}</span>
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>✨ First-time setup:</strong> Make yourself the first admin! No secret required for the initial admin user.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="secret" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Setup Secret (optional for first admin)
            </label>
            <input
              type="password"
              id="secret"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Leave empty for first admin"
            />
            <p className="mt-1 text-xs text-gray-500">
              If an admin already exists, you'll need the secret: IA8BkNILioO8DaMGU6kbSKfMApTbLEEZCpGgpaj2hoE=
            </p>
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Setting up...' : 'Make Me Admin'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            After becoming an admin, you can delete the files:
            <br />
            • <code className="bg-gray-100 px-1 py-0.5 rounded">src/app/setup-admin/page.tsx</code>
            <br />
            • <code className="bg-gray-100 px-1 py-0.5 rounded">src/app/api/admin/make-admin/route.ts</code>
          </p>
        </div>
      </div>
    </div>
  )
}
