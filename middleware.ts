import { createMiddlewareClient } from '@/lib/supabase'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Skip middleware for static assets and API routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return response
  }

  // Create Supabase client for middleware
  const supabase = createMiddlewareClient(request, response)

  // Check for authentication more reliably
  let session = null
  try {
    const { data } = await supabase.auth.getSession()
    session = data.session
    
    // Also check for auth token in cookies as backup
    if (!session) {
      const authCookie = request.cookies.get('sb-itsayes-auth-token')
      if (authCookie) {
        try {
          const authData = JSON.parse(authCookie.value)
          if (authData.access_token && authData.expires_at > Date.now() / 1000) {
            // Token exists and isn't expired
            session = { user: authData.user }
          }
        } catch (e) {
          // Invalid cookie format, ignore
        }
      }
    }
  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Session check error:', error instanceof Error ? error.message : 'Unknown error')
    }
    session = null
  }

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/onboarding',
  ]

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Authentication logic
  if (isProtectedRoute) {
    if (!session) {
      // Redirect to sign in if not authenticated
      const redirectUrl = new URL('/auth/signin', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirect authenticated users away from auth pages
  const authRoutes = ['/auth/signin', '/auth/signup', '/auth/reset-password']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  if (isAuthRoute && session) {
    // Check if there's a redirect URL, otherwise go to onboarding
    const redirectTo = request.nextUrl.searchParams.get('redirectTo')
    const redirectUrl = new URL(redirectTo || '/onboarding', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Special handling for root path
  if (pathname === '/') {
    // Allow everyone to access landing page
    // Users can decide where they want to go from there
    return response
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}