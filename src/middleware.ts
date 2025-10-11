import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.isAdmin === true
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

    // If trying to access admin routes without admin privileges
    if (isAdminRoute && !isAdmin) {
      // Redirect to home page with error message
      const url = new URL('/', req.url)
      url.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Admin routes require authentication
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return !!token
        }
        // Other protected routes (if any)
        return true
      },
    },
  }
)

// Specify which routes should use this middleware
export const config = {
  matcher: [
    '/admin/:path*',
    // Add other protected routes here if needed
  ],
}
