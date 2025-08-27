'use client'

import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'

interface AIInsightsProps {
  insights: string[]
  onGetMoreInsights?: () => void
  isLoadingMore?: boolean
}

export const AIInsights = memo(function AIInsights({
  insights,
  onGetMoreInsights,
  isLoadingMore = false
}: AIInsightsProps) {
  if (!insights || insights.length === 0) {
    return (
      <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg">
        <div className="text-center space-y-3">
          <div className="p-3 bg-yellow-100 rounded-full w-fit mx-auto">
            <Icon name="lightbulb" className="h-6 w-6 text-yellow-600" />
          </div>
          <p className="text-gray-500">No insights available yet.</p>
          {onGetMoreInsights && (
            <Button onClick={onGetMoreInsights} variant="outline" size="sm">
              Generate Insights
            </Button>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="p-3 bg-yellow-100 rounded-full">
            <Icon name="lightbulb" className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">AI Recommendations</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {insights.length} insight{insights.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400 transition-colors hover:bg-yellow-100"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {insight}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          {onGetMoreInsights && (
            <div className="mt-6 flex justify-center">
              <Button
                onClick={onGetMoreInsights}
                variant="outline"
                size="sm"
                disabled={isLoadingMore}
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-50"
              >
                {isLoadingMore ? (
                  <>
                    <Icon name="loader" className="h-4 w-4 mr-2 animate-spin" />
                    Generating more insights...
                  </>
                ) : (
                  <>
                    <Icon name="plus" className="h-4 w-4 mr-2" />
                    Get More Insights
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
})

export default AIInsights