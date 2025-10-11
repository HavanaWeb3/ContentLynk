'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface BetaApplication {
  id: string
  name: string
  email: string
  platform: string
  niche: string
  posts: number
  engagement: string
  reason: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function BetaApplicationsAdmin() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<BetaApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [error, setError] = useState('')

  // Check authentication and admin status
  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/beta-applications')
      return
    }

    if (session && !session.user.isAdmin) {
      router.push('/?error=unauthorized')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user.isAdmin) {
      fetchApplications()
    }
  }, [filter, session])

  const fetchApplications = async () => {
    setLoading(true)
    setError('')
    try {
      const url = filter === 'ALL'
        ? '/api/beta-applications'
        : `/api/beta-applications?status=${filter}`

      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        setApplications(data.applications)
      } else {
        setError(data.error || 'Failed to load applications')
      }
    } catch (err) {
      setError('Failed to load applications')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      WAITLIST: 'bg-blue-100 text-blue-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  // Show loading state while checking auth
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

  // Only render if user is authenticated and admin
  if (!session?.user.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Beta Applications</h1>
              <p className="text-gray-600 mt-1">Review and manage creator applications</p>
              <p className="text-sm text-green-600 mt-1">✓ Logged in as admin: {session.user.email}</p>
            </div>
            <Link href="/">
              <Button variant="outline">← Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-700">Filter by status:</span>
            <div className="flex gap-2">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'WAITLIST'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <button
              onClick={fetchApplications}
              className="ml-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-indigo-600">{applications.length}</div>
            <div className="text-gray-600 mt-1">Total Applications</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-yellow-600">
              {applications.filter(a => a.status === 'PENDING').length}
            </div>
            <div className="text-gray-600 mt-1">Pending Review</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">
              {applications.filter(a => a.status === 'APPROVED').length}
            </div>
            <div className="text-gray-600 mt-1">Approved</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-gray-600">
              {Math.max(0, 100 - applications.filter(a => a.status === 'APPROVED').length)}
            </div>
            <div className="text-gray-600 mt-1">Spots Remaining</div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading applications...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchApplications}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 text-lg">No applications found</p>
              <p className="text-gray-500 mt-2">Applications will appear here when creators submit the beta form</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Niche
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{app.name}</div>
                        <div className="text-sm text-gray-500">{app.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="capitalize">{app.platform}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {app.niche}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{app.posts} posts/month</div>
                        <div className="text-sm text-gray-500">{app.engagement}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            // Show full details in alert for now
                            alert(`Full Application Details:\n\nName: ${app.name}\nEmail: ${app.email}\nPlatform: ${app.platform}\nNiche: ${app.niche}\nMonthly Posts: ${app.posts}\nEngagement: ${app.engagement}\n\nReason for joining:\n${app.reason}`)
                          }}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Note */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong>✅ Secure:</strong> This admin page is now protected with authentication. Only users with admin privileges can access this page.
            To update application status, you can add status update functionality or use Prisma Studio.
          </p>
        </div>
      </div>
    </div>
  )
}
