import { ErrorBoundary } from '@/components/ui/error-boundary'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}