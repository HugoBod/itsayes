'use client'

import { useState, useEffect } from 'react'

export function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const authCookie = document.cookie
          .split(';')
          .find(cookie => cookie.trim().startsWith('sb-itsayes-auth-token='))

        if (authCookie) {
          const cookieValue = authCookie.split('=')[1]
          const authData = JSON.parse(cookieValue)
          
          if (authData.access_token && authData.expires_at > Date.now() / 1000) {
            setIsAuthenticated(true)
            setUserEmail(authData.user?.email || null)
          } else {
            setIsAuthenticated(false)
            setUserEmail(null)
          }
        } else {
          setIsAuthenticated(false)
          setUserEmail(null)
        }
      } catch (error) {
        setIsAuthenticated(false)
        setUserEmail(null)
      }
    }

    checkAuthStatus()
    
    // Check auth status on cookie changes
    const interval = setInterval(checkAuthStatus, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return { isAuthenticated, userEmail }
}