'use client'

import { useEffect } from 'react'

export default function LogoutPage() {
  useEffect(() => {
    // Clear the auth token cookie
    document.cookie = 'sb-itsayes-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=lax'
    
    // Clear all Supabase-related cookies
    const cookies = document.cookie.split(';')
    cookies.forEach(cookie => {
      const [name] = cookie.trim().split('=')
      if (name.includes('supabase') || name.includes('sb-')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=lax`
      }
    })
    
    // Clear localStorage and sessionStorage
    localStorage.clear()
    sessionStorage.clear()
    
    // Redirect to landing page after clearing
    setTimeout(() => {
      window.location.href = '/'
    }, 500)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Signing out...</p>
      </div>
    </div>
  )
}