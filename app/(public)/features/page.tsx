import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'

const featureCategories = [
  {
    title: 'Planning & Organization',
    description: 'Essential tools to plan your wedding from start to finish',
    features: [
      {
        name: 'AI Wedding Assistant',
        description: 'Get personalized recommendations and smart planning assistance powered by artificial intelligence',
        icon: 'brain',
        status: 'Available'
      },
      {
        name: 'Timeline Management',
        description: 'Create and track your wedding timeline with automated reminders and milestones',
        icon: 'calendar',
        status: 'Available'
      },
      {
        name: 'Task Checklist',
        description: 'Never miss a detail with our comprehensive wedding planning checklist',
        icon: 'checkCircle',
        status: 'Available'
      },
      {
        name: 'Vendor Management',
        description: 'Find, compare, and manage all your wedding vendors in one place',
        icon: 'mapPin',
        status: 'Available'
      }
    ]
  },
  {
    title: 'Budget & Finance',
    description: 'Keep your wedding expenses under control',
    features: [
      {
        name: 'Smart Budget Tracker',
        description: 'Track expenses, compare costs, and get alerts when approaching budget limits',
        icon: 'dollarSign',
        status: 'Available'
      },
      {
        name: 'Expense Analytics',
        description: 'Visualize your spending patterns with detailed charts and insights',
        icon: 'trending',
        status: 'Available'
      },
      {
        name: 'Payment Reminders',
        description: 'Never miss a vendor payment with automated reminders and due dates',
        icon: 'alertCircle',
        status: 'Coming Soon'
      }
    ]
  },
  {
    title: 'Guest Management',
    description: 'Manage your guest list and RSVPs effortlessly',
    features: [
      {
        name: 'Guest List Manager',
        description: 'Organize guests by family, friends, and plus-ones with custom categories',
        icon: 'users',
        status: 'Available'
      },
      {
        name: 'RSVP Tracking',
        description: 'Send digital invitations and track responses in real-time',
        icon: 'mail',
        status: 'Available'
      },
      {
        name: 'Seating Chart Builder',
        description: 'Create beautiful seating arrangements with drag-and-drop functionality',
        icon: 'table',
        status: 'Available'
      },
      {
        name: 'Dietary Preferences',
        description: 'Track guest dietary restrictions and preferences for catering',
        icon: 'utensils',
        status: 'Available'
      }
    ]
  },
  {
    title: 'Design & Media',
    description: 'Bring your wedding vision to life',
    features: [
      {
        name: 'Photo Gallery',
        description: 'Create and share beautiful photo galleries with your loved ones',
        icon: 'image',
        status: 'Available'
      },
      {
        name: 'Design Inspiration',
        description: 'Browse thousands of wedding designs and create mood boards',
        icon: 'sparkles',
        status: 'Available'
      },
      {
        name: 'Music Playlist',
        description: 'Curate the perfect playlist for every moment of your special day',
        icon: 'heart',
        status: 'Coming Soon'
      }
    ]
  }
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white from-20% via-primary/60 via-50% to-primary/80">
      <div className="pt-16 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 bg-muted text-primary text-sm font-medium rounded-full mb-4">
            Features Documentation
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-normal text-foreground mb-4">
            Everything you need for your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"> perfect wedding</span>
          </h1>
          <p className="text-xl text-warm max-w-2xl mx-auto">
            Discover all the powerful features that make ItsaYes the most comprehensive wedding planning platform.
          </p>
        </div>

        {/* Feature Categories */}
        <div className="space-y-16">
          {featureCategories.map((category) => (
            <div key={category.title}>
              <div className="mb-8">
                <h2 className="text-2xl font-serif font-normal text-foreground mb-2">{category.title}</h2>
                <p className="text-warm">{category.description}</p>
              </div>
              
              <div className="grid gap-6">
                {category.features.map((feature) => (
                  <Card key={feature.name} className="p-6 border-neutral-200 hover:border-neutral-300 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-md">
                        <Icon name={feature.icon as any} className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{feature.name}</h3>
                          <Badge 
                            variant={feature.status === 'Available' ? 'default' : 'secondary'}
                            className={feature.status === 'Available' 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            }
                          >
                            {feature.status}
                          </Badge>
                        </div>
                        <p className="text-warm leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="p-8 bg-gradient-warm border-border">
            <h2 className="text-2xl font-serif font-normal text-foreground mb-4">
              Ready to start planning your dream wedding?
            </h2>
            <p className="text-warm mb-6 max-w-lg mx-auto">
              Join thousands of couples who have planned their perfect day with ItsaYes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/signup"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Get Started Free
              </a>
              <a
                href="/community"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-neutral-700 hover:text-foreground font-medium rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors"
              >
                Browse Community
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
    </div>
  )
}