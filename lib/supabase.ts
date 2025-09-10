import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from './types/database'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Singleton client instance for client-side usage
let clientInstance: ReturnType<typeof createClient<Database>> | null = null

// Client-side Supabase client (singleton pattern)
export const createClientComponentClient = () => {
  if (clientInstance) {
    return clientInstance
  }
  
  clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Keep the default storage key to avoid breaking existing sessions
      storageKey: 'sb-itsayes-auth-token',
    },
  })
  
  return clientInstance
}

// Server Component client
export const createServerComponentClient = async () => {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Route Handler client (for API routes)
export const createRouteHandlerClient = (request: NextRequest, response?: NextResponse) => {
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          if (response) {
            response.cookies.set({
              name,
              value,
              ...options,
            })
          }
        },
        remove(name: string, options: any) {
          if (response) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          }
        },
      },
    }
  )
}

// Middleware client
export const createMiddlewareClient = (request: NextRequest, response: NextResponse) => {
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )
}

// Environment-aware client factory (uses singleton)
export const createEnvironmentClient = () => {
  // Always use the singleton to avoid multiple instances
  return createClientComponentClient()
}

// Utility to reset the singleton (useful for HMR or testing)
export const resetClientInstance = () => {
  if (clientInstance) {
    // Clean up any listeners or subscriptions
    clientInstance.auth.stopAutoRefresh?.()
    clientInstance = null
  }
}

// Hot Module Replacement cleanup
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  if ((window as any).module?.hot) {
    (window as any).module.hot.dispose(() => {
      resetClientInstance()
    })
  }
}