'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'

interface OnboardingButtonProps {
  // Content
  title: string
  subtitle?: string
  icon?: string
  iconColor?: string
  
  // State
  isSelected?: boolean
  isDisabled?: boolean
  
  // Behavior
  onClick?: () => void
  
  // Layout options
  variant?: 'selection' | 'simple'
  children?: ReactNode
}

export function OnboardingButton({
  title,
  subtitle,
  icon,
  iconColor = 'from-primary to-secondary',
  isSelected = false,
  isDisabled = false,
  onClick,
  variant = 'selection',
  children
}: OnboardingButtonProps) {
  
  const baseClasses = "w-full text-base sm:text-lg font-semibold transition-all duration-200 border-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
  
  const selectedClasses = isSelected 
    ? 'bg-primary hover:bg-primary-dark border-primary text-white shadow-primary'
    : 'border-border hover:border-primary hover:bg-muted hover:text-primary bg-card text-foreground'
    
  const disabledClasses = isDisabled
    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed hover:shadow-lg hover:translate-y-0'
    : ''

  const heightClass = 'h-12'
  const justifyClass = 'justify-start'

  if (variant === 'simple') {
    return (
      <Button
        size="lg"
        variant={isSelected ? 'default' : 'outline'}
        disabled={isDisabled}
        className={`${baseClasses} ${heightClass} ${justifyClass} ${disabledClasses || selectedClasses}`}
        onClick={onClick}
      >
        {icon && (
          <Icon 
            name={icon} 
            className={`h-5 w-5 sm:h-6 sm:w-6 ${subtitle ? 'mr-3' : 'mr-2'}`} 
          />
        )}
        <div className={subtitle ? 'text-left' : 'text-center'}>
          <div className="font-semibold">{title}</div>
          {subtitle && (
            <div className="text-sm font-normal opacity-75">{subtitle}</div>
          )}
        </div>
        {children}
      </Button>
    )
  }

  // Selection variant (with icon circle)
  return (
    <Button
      size="lg"
      variant={isSelected ? 'default' : 'outline'}
      disabled={isDisabled}
      className={`${baseClasses} ${heightClass} ${justifyClass} ${disabledClasses || selectedClasses}`}
      onClick={onClick}
    >
      {icon && (
        <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full mr-3 sm:mr-4 flex-shrink-0 ${
          isSelected 
            ? 'bg-white/20 text-white' 
            : isDisabled
            ? 'bg-gray-200 text-gray-400'
            : `bg-gradient-to-br ${iconColor} text-white`
        }`}>
          <Icon name={icon} className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      )}
      
      <div className="text-left flex-1">
        <div className="font-semibold">{title}</div>
        {subtitle && (
          <div className="text-sm font-normal opacity-75">{subtitle}</div>
        )}
      </div>
      
      {children}
    </Button>
  )
}

// Variant for navigation buttons (back/continue)
interface NavigationButtonProps {
  direction: 'back' | 'continue'
  disabled?: boolean
  onClick?: () => void
  children?: ReactNode
}

export function NavigationButton({ 
  direction, 
  disabled = false, 
  onClick, 
  children 
}: NavigationButtonProps) {
  if (direction === 'back') {
    return (
      <Button
        variant="ghost"
        onClick={onClick}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
      >
        <Icon name="arrowLeft" className="h-4 w-4" />
        <span>{children || 'Back'}</span>
      </Button>
    )
  }

  return (
    <Button 
      size="lg"
      disabled={disabled}
      className={`h-12 text-base font-semibold shadow-lg transition-all duration-200 px-8 ${
        disabled 
          ? 'bg-muted text-muted-foreground cursor-not-allowed' 
          : 'bg-secondary hover:bg-secondary-dark text-white hover:shadow-xl hover:-translate-y-0.5'
      }`}
      onClick={onClick}
    >
      {children || 'Continue'}
      <Icon name="arrowRight" className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
    </Button>
  )
}