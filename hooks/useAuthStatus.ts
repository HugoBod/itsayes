'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase'

export function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClientComponentClient()
    
    // Check initial session - mirror middleware logic
    const checkInitialSession = async () => {
      try {
        // First try to get session normally
        const { data: { session } } = await supabase.auth.getSession()
        let user = session?.user
        
        // If no session, check fallback cookie auth (like middleware)
        if (!user && typeof window !== 'undefined') {
          const authCookies = document.cookie.split(';').find(c => c.trim().startsWith('sb-itsayes-auth-token='))
          if (authCookies) {
            try {
              const cookieValue = authCookies.split('=')[1]
              const authData = JSON.parse(decodeURIComponent(cookieValue))
              if (authData.access_token && 
                  authData.expires_at && 
                  authData.expires_at > Date.now() / 1000 &&
                  authData.user && 
                  authData.user.id) {
                user = authData.user
                console.log('🔍 useAuthStatus: Using fallback cookie auth for user:', authData.user.id)
              }
            } catch (e) {
              console.log('🔍 useAuthStatus: Cookie parse error:', e)
            }
          }
        }
        
        if (user) {
          setIsAuthenticated(true)
          setUserEmail(user.email || null)
        } else {
          setIsAuthenticated(false)
          setUserEmail(null)
        }
      } catch (error) {
        console.error('Error checking auth status:', error)
        setIsAuthenticated(false)
        setUserEmail(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: any, session: any) => {
        if (session?.user) {
          setIsAuthenticated(true)
          setUserEmail(session.user.email || null)
        } else {
          setIsAuthenticated(false)
          setUserEmail(null)
        }
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { isAuthenticated, userEmail, isLoading }
}