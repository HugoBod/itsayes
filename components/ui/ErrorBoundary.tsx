'use client'

import React, { ErrorInfo, ReactNode } from 'react'
import { Icon } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-100">
          <div className="text-center space-y-4 max-w-md p-6">
            <Icon name="alertCircle" className="h-16 w-16 text-red-500 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
              <p className="text-gray-600 text-sm">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                }}
                variant="outline"
                size="sm"
              >
                <Icon name="refreshCw" className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                size="sm"
              >
                <Icon name="rotateCcw" className="h-4 w-4 mr-2" />
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Functional component wrapper for easier usage
export function ErrorBoundaryWrapper({ 
  children, 
  fallback, 
  onError 
}: ErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary