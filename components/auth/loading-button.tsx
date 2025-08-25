import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'

interface LoadingButtonProps {
  isLoading: boolean
  loadingText: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export const LoadingButton = memo(function LoadingButton({
  isLoading,
  loadingText,
  children,
  disabled,
  className,
  type = 'button',
}: LoadingButtonProps) {
  return (
    <Button
      type={type}
      className={className}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <div className="flex items-center">
          <Icon name="loader-2" className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </div>
      ) : (
        children
      )}
    </Button>
  )
})