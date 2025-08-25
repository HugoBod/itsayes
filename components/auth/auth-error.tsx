import { memo } from 'react'
import { Icon } from '@/components/ui/icons'

interface AuthErrorProps {
  error: string
}

export const AuthError = memo(function AuthError({ error }: AuthErrorProps) {
  return (
    <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
      <div className="flex items-center">
        <Icon name="alert-circle" className="h-4 w-4 text-destructive mr-2" />
        <p className="text-sm text-destructive">{error}</p>
      </div>
    </div>
  )
})