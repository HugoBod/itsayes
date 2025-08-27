import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icons'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing Plans',
  description: 'Choose the perfect wedding planning package for your needs. Flexible pricing for couples and professional wedding planners.',
  keywords: ['wedding planning pricing', 'wedding planner cost', 'event planning packages'],
}

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with your wedding planning',
    features: [
      'Basic planning tools',
      'Up to 50 guests',
      'Budget tracker',
      'Public project sharing',
      'Community access',
      'Mobile app access',
    ],
    cta: 'Start Free',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: 'per month',
    description: 'Everything you need for your perfect wedding',
    features: [
      'Everything in Free',
      'Unlimited guests',
      'Advanced budget analytics',
      'Vendor management',
      'Seating chart planner',
      'Priority support',
      'Custom invitations',
      'Timeline templates',
    ],
    cta: 'Start Pro Trial',
    href: '/signup?plan=pro',
    highlighted: true,
  },
  {
    name: 'Premium',
    price: '$49',
    period: 'per month',
    description: 'For couples who want the ultimate planning experience',
    features: [
      'Everything in Pro',
      'Dedicated wedding consultant',
      'Custom design themes',
      'Unlimited file storage',
      'Guest RSVP management',
      'Registry integration',
      'Live event dashboard',
      'White-label options',
    ],
    cta: 'Contact Sales',
    href: '/signup?plan=premium',
    highlighted: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white from-20% via-primary/60 via-50% to-primary/80">
      <div className="pt-16 pb-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-serif font-normal text-foreground mb-2">
            Simple, Transparent Pricing
          </h1>
          <p className="text-sm md:text-base text-warm max-w-xl mx-auto">
            Choose the perfect plan for your wedding. Start free and upgrade as you need more features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden ${
                plan.highlighted
                  ? 'border-primary shadow-primary scale-102'
                  : 'border-neutral-200'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-0 bg-primary text-white px-2 py-1 text-xs font-medium rounded-bl">
                  Most Popular
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-bold text-foreground mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-xs text-warm">/{plan.period}</span>
                </div>
                <p className="text-xs text-warm mb-3">{plan.description}</p>
                
                <Button
                  size="sm"
                  className={
                    plan.highlighted
                      ? 'w-full bg-primary hover:bg-primary-600 text-white border-0 hover:-translate-y-0.5'
                      : 'w-full'
                  }
                  variant={plan.highlighted ? 'default' : 'outline'}
                  asChild
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>

                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Icon name="checkCircle" className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-warm text-xs">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>

        <div className="bg-gradient-warm rounded-xl p-4 md:p-6 text-center">
          <h2 className="text-lg font-serif font-normal text-foreground mb-2">
            Need a Custom Plan?
          </h2>
          <p className="text-sm text-warm mb-4 max-w-lg mx-auto">
            We offer custom plans for wedding planners, venues, and agencies. Get in touch to discuss your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="sm" variant="outline" className="border-neutral-300">
              <Icon name="phone" className="mr-1 h-4 w-4" />
              Schedule a Call
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary-600 text-white border-0 hover:-translate-y-0.5"
            >
              <Icon name="mail" className="mr-1 h-4 w-4" />
              Contact Sales
            </Button>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-serif font-normal text-foreground text-center mb-6">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              {
                q: 'Can I change plans later?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                q: 'Is there a free trial for Pro plans?',
                a: 'Yes, all Pro and Premium plans come with a 14-day free trial. No credit card required.',
              },
              {
                q: 'What happens to my data if I cancel?',
                a: 'Your data remains accessible for 30 days after cancellation. You can export it anytime.',
              },
              {
                q: 'Do you offer discounts for annual billing?',
                a: 'Yes! Save 20% when you pay annually. Contact us for annual pricing options.',
              },
            ].map((faq, index) => (
              <Card key={index} className="p-4 border-neutral-200">
                <h3 className="font-semibold text-foreground mb-1 text-sm">{faq.q}</h3>
                <p className="text-warm text-xs">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}