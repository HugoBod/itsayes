import { memo } from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default memo(function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
})