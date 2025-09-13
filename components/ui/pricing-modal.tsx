'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icons'

interface PricingPlan {
  id: 'free' | 'pro' | 'team'
  name: string
  price: string
  period: string
  description: string
  features: string[]
  popular?: boolean
  cta: string
}

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectPlan: (plan: 'free' | 'pro' | 'team') => Promise<void>
  isLoading?: boolean
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '0€',
    period: 'forever',
    description: 'Share your wedding vision with the community',
    features: [
      'Public wedding project',
      'Visible in community gallery',
      'Inspire other couples',
      'Basic planning tools',
      'Moodboard generation'
    ],
    cta: 'Start Free & Share'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '29€',
    period: 'per month',
    description: 'Private planning with advanced features',
    popular: true,
    features: [
      'Private wedding project',
      'Advanced planning tools',
      'Premium templates',
      'Priority support',
      'Export capabilities'
    ],
    cta: 'Go Pro'
  },
  {
    id: 'team',
    name: 'Team',
    price: '79€',
    period: 'per month',
    description: 'Perfect for wedding planners and teams',
    features: [
      'Multiple private projects',
      'Team collaboration',
      'Client management',
      'White-label branding',
      'Analytics dashboard'
    ],
    cta: 'Start Team Plan'
  }
]

export function PricingModal({ isOpen, onClose, onSelectPlan, isLoading = false }: PricingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'team'>('free')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSelectPlan = async (planId: 'free' | 'pro' | 'team') => {
    if (isProcessing || isLoading) return
    
    setIsProcessing(true)
    try {
      await onSelectPlan(planId)
    } catch (error) {
      console.error('Error selecting plan:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] overflow-hidden p-0 bg-white">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-6 py-6 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="text-center space-y-2">
              <DialogTitle className="text-2xl font-serif text-foreground">
                Choose Your Wedding Journey
              </DialogTitle>
              <p className="text-warm max-w-2xl mx-auto">
                Select the perfect plan to bring your dream wedding to life. Start free and upgrade anytime.
              </p>
            </div>
          </DialogHeader>

          {/* Plans Grid */}
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {PRICING_PLANS.map((plan, index) => (
                <div
                  key={plan.id}
                  className={`
                    relative bg-white rounded-xl border-2 p-6 cursor-pointer transition-all duration-200
                    ${selectedPlan === plan.id 
                      ? 'border-primary shadow-lg scale-[1.02]' 
                      : 'border-neutral-200 hover:border-primary/50 hover:shadow-md'
                    }
                    ${plan.popular ? 'ring-1 ring-primary/20' : ''}
                    animate-in fade-in slide-in-from-bottom-4
                  `}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationDuration: '0.3s',
                    animationFillMode: 'both'
                  }}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-white px-3 py-1 text-xs font-medium">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  {/* Radio Button */}
                  <div className="absolute top-4 right-4">
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${selectedPlan === plan.id ? 'border-primary bg-primary' : 'border-neutral-300'}
                    `}>
                      {selectedPlan === plan.id && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </div>

                  {/* Plan Content */}
                  <div className="space-y-4">
                    {/* Header */}
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                        <span className="text-sm text-warm">/{plan.period}</span>
                      </div>
                      <p className="text-sm text-warm">{plan.description}</p>
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Icon name="check" className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Special Note for Free Plan */}
                    {plan.id === 'free' && (
                      <div className="bg-primary/5 rounded-lg p-3 mt-4">
                        <div className="flex items-start gap-2">
                          <Icon name="users" className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-primary">
                            <p className="font-medium mb-1">🌟 Community Sharing</p>
                            <p className="mb-2">Your wedding project will automatically become <strong>public</strong> and appear in our community gallery to inspire other couples.</p>
                            <p className="text-xs opacity-80">✓ Personal details (names, exact dates) will be anonymized for privacy</p>
                            <p className="text-xs opacity-80">✓ Your moodboard and style choices will be featured</p>
                            <p className="text-xs opacity-80">✓ Help build the world's most beautiful wedding inspiration gallery</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Privacy Note for Pro/Team */}
                    {(plan.id === 'pro' || plan.id === 'team') && (
                      <div className="bg-green-50 rounded-lg p-3 mt-4">
                        <div className="flex items-center gap-2">
                          <Icon name="checkCircle" className="h-4 w-4 text-green-600" />
                          <span className="text-xs font-medium text-green-700">100% Private</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t bg-neutral-50/50 px-6 py-4">
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              <div className="text-sm text-warm">
                {selectedPlan === 'free' 
                  ? "✨ Start for free and upgrade anytime" 
                  : "💳 Cancel anytime • 30-day money back guarantee"
                }
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isProcessing || isLoading}
                  className="border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                >
                  Back to Summary
                </Button>
                
                <Button
                  onClick={() => handleSelectPlan(selectedPlan)}
                  disabled={isProcessing || isLoading}
                  className="bg-primary hover:bg-primary-600 text-white min-w-[140px]"
                >
                  {isProcessing || isLoading ? (
                    <div className="flex items-center gap-2">
                      <Icon name="loader" className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    PRICING_PLANS.find(p => p.id === selectedPlan)?.cta || 'Continue'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}