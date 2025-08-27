'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export const Skeleton = memo(function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={cn(
        "animate-pulse rounded-md bg-gray-200", 
        className
      )} 
    />
  )
})

interface MoodboardSkeletonProps {
  className?: string
}

export const MoodboardSkeleton = memo(function MoodboardSkeleton({ className }: MoodboardSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Skeleton */}
      <div className="text-center space-y-2">
        <Skeleton className="h-8 lg:h-10 w-3/4 mx-auto" />
        <Skeleton className="h-5 lg:h-6 w-1/2 mx-auto" />
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Image Skeleton */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="text-center space-y-2">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-3 w-48 mx-auto" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-6">
          {/* Wedding Story Card */}
          <div className="p-6 space-y-3 bg-white/80 rounded-lg">
            <div className="flex items-start space-x-3">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0 mt-1" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </div>

          {/* Style Guide Card */}
          <div className="p-6 space-y-4 bg-white/80 rounded-lg">
            <div className="flex items-start space-x-3">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0 mt-1" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-24" />
                
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-full" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-18 rounded-full" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="p-6 space-y-4 bg-white/80 rounded-lg">
            <div className="flex items-start space-x-3">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0 mt-1" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-32" />
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                      <Skeleton className="h-2 w-2 rounded-full mt-2 flex-shrink-0" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="mt-8 lg:mt-12 text-center space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center max-w-md mx-auto">
          <Skeleton className="h-12 flex-1 rounded-md" />
          <Skeleton className="h-12 flex-1 rounded-md" />
        </div>
        <Skeleton className="h-3 w-64 mx-auto" />
      </div>
    </div>
  )
})

interface DashboardMoodboardSkeletonProps {
  className?: string
}

export const DashboardMoodboardSkeleton = memo(function DashboardMoodboardSkeleton({ 
  className 
}: DashboardMoodboardSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Moodboard Preview */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="text-center space-y-1">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-3 w-48 mx-auto" />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="space-y-4">
          <div className="p-6 space-y-2 bg-white/90 rounded-lg">
            <div className="flex items-start space-x-3">
              <Skeleton className="h-5 w-5 rounded flex-shrink-0 mt-1" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          </div>

          <div className="p-6 space-y-3 bg-white/90 rounded-lg">
            <div className="flex items-start space-x-3">
              <Skeleton className="h-5 w-5 rounded flex-shrink-0 mt-1" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
                <div className="flex flex-wrap gap-1 mt-3">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-8 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </div>
  )
})

export default Skeleton