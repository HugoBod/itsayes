import { createMiddlewareClient } from '@/lib/supabase'
import { NextResponse, type NextRequest } from 'next/server'

// Helper function to check onboarding status server-side
async function checkOnboardingStatus(supabase: any, userId: string): Promise<boolean> {
  try {
    // Get user's workspace through workspace_members
    const { data: member, error: memberError } = await supabase
      .from('workspace_members')
      .select(`
        workspace:workspaces!inner (
          onboarding_completed_at
        )
      `)
      .eq('user_id', userId)
      .single()

    if (memberError || !member?.workspace) {
      return false
    }

    return !!member.workspace.onboarding_completed_at
  } catch (error) {
    console.log('🔍 MIDDLEWARE: checkOnboardingStatus error:', error)
    return false
  }
}

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
    
    // DEBUG: Log session status
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 MIDDLEWARE DEBUG:', {
        pathname,
        hasSession: !!session,
        cookieCount: request.cookies.size,
      })
    }
    
    // Also check for auth token in cookies as backup (only if Supabase session exists)
    if (!session) {
      const authCookie = request.cookies.get('sb-itsayes-auth-token')
      if (authCookie) {
        try {
          const authData = JSON.parse(authCookie.value)
          // More strict validation: require valid access_token, expires_at, AND valid user
          if (authData.access_token && 
              authData.expires_at && 
              authData.expires_at > Date.now() / 1000 &&
              authData.user && 
              authData.user.id) {
            session = { user: authData.user }
            console.log('🔍 MIDDLEWARE: Using fallback cookie auth for user:', authData.user.id)
          } else {
            console.log('🔍 MIDDLEWARE: Cookie auth failed validation')
          }
        } catch (e) {
          console.log('🔍 MIDDLEWARE: Cookie parse error:', e)
        }
      } else {
        console.log('🔍 MIDDLEWARE: No auth cookie found')
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
      console.log('🔍 MIDDLEWARE: Unauthenticated user on protected route, redirecting to signin')
      return NextResponse.redirect(redirectUrl)
    } else {
      // Authenticated user on protected route - smart routing
      if (pathname.startsWith('/onboarding')) {
        try {
          console.log('🔍 MIDDLEWARE: Authenticated user accessing onboarding, checking if completed...')
          const isCompleted = await checkOnboardingStatus(supabase, session.user.id)
          if (isCompleted) {
            console.log('🔍 MIDDLEWARE: Onboarding completed, redirecting to dashboard')
            const redirectUrl = new URL('/dashboard', request.url)
            return NextResponse.redirect(redirectUrl)
          }
          console.log('🔍 MIDDLEWARE: Onboarding not completed, allowing access to onboarding')
        } catch (error) {
          console.log('🔍 MIDDLEWARE: Error checking onboarding for protected route:', error)
        }
      }
    }
  }

  // Redirect authenticated users away from auth pages
  const authRoutes = ['/auth/signin', '/auth/signup', '/auth/reset-password']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  if (isAuthRoute && session) {
    console.log('🔍 MIDDLEWARE: Authenticated user on auth route, redirecting...')
    // Check if there's a specific redirect URL first
    const redirectTo = request.nextUrl.searchParams.get('redirectTo')
    if (redirectTo) {
      console.log('🔍 MIDDLEWARE: Using specific redirect:', redirectTo)
      const redirectUrl = new URL(redirectTo, request.url)
      return NextResponse.redirect(redirectUrl)
    }
    
    // Smart redirection based on onboarding status
    try {
      console.log('🔍 MIDDLEWARE: Checking onboarding status for user:', session.user.id)
      const isCompleted = await checkOnboardingStatus(supabase, session.user.id)
      const destination = isCompleted ? '/dashboard' : '/onboarding'
      console.log('🔍 MIDDLEWARE: Onboarding completed:', isCompleted, '-> redirecting to:', destination)
      const redirectUrl = new URL(destination, request.url)
      return NextResponse.redirect(redirectUrl)
    } catch (error) {
      console.log('🔍 MIDDLEWARE: Error checking onboarding status:', error)
      const redirectUrl = new URL('/onboarding', request.url)
      return NextResponse.redirect(redirectUrl)
    }
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