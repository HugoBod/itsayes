'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@/components/ui/icons'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  onPointerDownOutside?: (event: PointerEvent) => void
}

interface DialogHeaderProps {
  children: React.ReactNode
  className?: string
}

interface DialogTitleProps {
  children: React.ReactNode
  className?: string
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, onOpenChange, mounted])

  if (!mounted) return null

  return (
    <>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { open, onOpenChange } as any)
        }
        return child
      })}
    </>
  )
}

const DialogContent = ({ 
  children, 
  className = '', 
  open, 
  onOpenChange 
}: DialogContentProps & { open?: boolean; onOpenChange?: (open: boolean) => void }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => onOpenChange?.(false)}
          />
        )}
      </AnimatePresence>

      {/* Dialog */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`
                  relative bg-white rounded-lg shadow-xl max-h-[90vh] w-full
                  ${className}
                `}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={() => onOpenChange?.(false)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close dialog"
                >
                  <Icon name="x" className="h-4 w-4 text-gray-500" />
                </button>
                
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

const DialogHeader = ({ children, className = '' }: DialogHeaderProps) => (
  <div className={`p-6 border-b border-gray-200 ${className}`}>
    {children}
  </div>
)

const DialogTitle = ({ children, className = '' }: DialogTitleProps) => (
  <h2 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h2>
)

export { Dialog, DialogContent, DialogHeader, DialogTitle }