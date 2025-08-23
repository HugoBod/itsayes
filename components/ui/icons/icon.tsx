import { memo } from 'react'
import { type LucideIcon } from 'lucide-react'
import { iconRegistry, type IconName } from './icon-registry'

export interface IconProps {
  name: IconName
  className?: string
  size?: number | string
  strokeWidth?: number
}

export const Icon = memo(function Icon({
  name,
  className = '',
  size,
  strokeWidth = 2,
}: IconProps) {
  const IconComponent = iconRegistry[name] as LucideIcon
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in registry`)
    return null
  }

  return (
    <IconComponent
      className={className}
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden="true"
    />
  )
})

export const SmallIcon = memo(function SmallIcon({
  name,
  className = '',
  ...props
}: Omit<IconProps, 'size'>) {
  return (
    <Icon
      name={name}
      className={`h-4 w-4 ${className}`}
      {...props}
    />
  )
})

export const LargeIcon = memo(function LargeIcon({
  name,
  className = '',
  ...props
}: Omit<IconProps, 'size'>) {
  return (
    <Icon
      name={name}
      className={`h-6 w-6 ${className}`}
      {...props}
    />
  )
})