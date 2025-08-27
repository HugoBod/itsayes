import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { Logo } from '@/components/ui/logo'

interface AuthCardProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export const AuthCard = memo(function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Logo size="lg" className="justify-center mb-6" />
          <h1 className="text-3xl font-serif tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        <Card className="p-8">
          {children}
        </Card>
      </div>
    </div>
  )
})