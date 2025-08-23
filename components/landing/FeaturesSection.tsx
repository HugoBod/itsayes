'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icons'

const features = [
  { name: 'AI Planning', icon: 'brain', color: 'from-primary to-secondary' },
  { name: 'Budget Tracker', icon: 'dollarSign', color: 'from-green-500 to-emerald-500' },
  { name: 'Guest Lists', icon: 'users', color: 'from-blue-500 to-cyan-500' },
  { name: 'Vendor Manager', icon: 'mapPin', color: 'from-orange-500 to-red-500' },
  { name: 'Timeline', icon: 'calendar', color: 'from-pink-500 to-rose-500' },
  { name: 'Checklist', icon: 'checkCircle', color: 'from-indigo-500 to-purple-500' },
  { name: 'RSVP Tracking', icon: 'mail', color: 'from-teal-500 to-green-500' },
  { name: 'Seating Chart', icon: 'table', color: 'from-yellow-500 to-orange-500' },
  
  // Row 2
  { name: 'Photo Gallery', icon: 'image', color: 'from-secondary to-primary' },
  { name: 'Music Playlist', icon: 'heart', color: 'from-red-500 to-pink-500' },
  { name: 'Menu Planning', icon: 'utensils', color: 'from-amber-500 to-orange-500' },
  { name: 'Invitations', icon: 'send', color: 'from-blue-500 to-indigo-500' },
  { name: 'Gift Registry', icon: 'receipt', color: 'from-emerald-500 to-teal-500' },
  { name: 'Weather Check', icon: 'sparkles', color: 'from-sky-500 to-blue-500' },
  { name: 'Transportation', icon: 'mapPin', color: 'from-violet-500 to-purple-500' },
  { name: 'Accommodations', icon: 'home', color: 'from-rose-500 to-pink-500' },

  // Row 3  
  { name: 'Dress Fitting', icon: 'user', color: 'from-pink-500 to-rose-500' },
  { name: 'Flower Orders', icon: 'sparkles', color: 'from-green-500 to-teal-500' },
  { name: 'Photography', icon: 'image', color: 'from-indigo-500 to-blue-500' },
  { name: 'Videography', icon: 'image', color: 'from-primary to-success' },
  { name: 'Cake Design', icon: 'heart', color: 'from-orange-500 to-amber-500' },
  { name: 'Decorations', icon: 'sparkles', color: 'from-teal-500 to-cyan-500' },
  { name: 'Lighting', icon: 'sparkles', color: 'from-yellow-500 to-amber-500' },
  { name: 'Sound System', icon: 'users', color: 'from-red-500 to-orange-500' },
  
  // Row 4
  { name: 'Honeymoon', icon: 'heart', color: 'from-blue-500 to-purple-500' },
  { name: 'Thank You Cards', icon: 'mail', color: 'from-pink-500 to-red-500' },
  { name: 'Party Favors', icon: 'sparkles', color: 'from-green-500 to-blue-500' },
  { name: 'Rehearsal Dinner', icon: 'utensils', color: 'from-orange-500 to-pink-500' },
  { name: 'Bachelor Party', icon: 'users', color: 'from-secondary to-primary' },
  { name: 'Bridal Shower', icon: 'heart', color: 'from-rose-500 to-pink-500' },
  { name: 'Venue Tour', icon: 'mapPin', color: 'from-teal-500 to-green-500' },
  { name: 'Insurance', icon: 'checkCircle', color: 'from-amber-500 to-orange-500' },
]

const bigFeatures = [
  {
    name: 'AI Wedding Assistant',
    description: 'Get personalized recommendations and smart planning assistance',
    icon: 'brain',
    color: 'from-primary to-secondary'
  },
  {
    name: 'Complete Budget Management', 
    description: 'Track expenses, compare vendors, and stay within budget',
    icon: 'dollarSign',
    color: 'from-green-500 to-emerald-500'
  }
]

export function FeaturesSection() {
  return (
    <section className="py-20 bg-neutral-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-1">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 bg-muted text-primary text-sm font-medium rounded-full mb-4">
            Features
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground mb-4 leading-tight">
            Every feature your wedding needs to
            <br />
            <span className="text-gradient-luxury">
              be planned perfectly
            </span>
          </h2>
          <p className="font-sans text-lg text-warm max-w-2xl mx-auto mb-8 leading-relaxed">
            From AI-powered planning to budget tracking, we have everything you need for your special day.
          </p>
          <Button 
            className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3"
            asChild
          >
            <Link href="/features">Discover all features</Link>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="relative">
          <div className="grid grid-cols-6 gap-4">
            {/* Row 1 - 6 petits widgets */}
            {features.slice(0, 6).map((feature) => (
              <Link key={feature.name} href="/features">
                <Card className="h-24 rounded-2xl border border-transparent hover:border-purple-400 bg-white shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer">
                  <div className="h-full flex flex-col items-center justify-center p-3 text-center">
                    <div className="mb-2">
                      <Icon name={feature.icon as any} className="h-5 w-5 text-neutral-400 group-hover:text-purple-500 transition-colors duration-200" />
                    </div>
                    <span className="text-xs font-medium text-warm group-hover:text-foreground leading-tight transition-colors duration-200">{feature.name}</span>
                  </div>
                </Card>
              </Link>
            ))}

            {/* Row 2 - 1 petit à gauche */}
            <Link key={features[6].name} href="/features">
              <Card className="h-24 rounded-2xl border border-transparent hover:border-purple-400 bg-white shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer">
                <div className="h-full flex flex-col items-center justify-center p-3 text-center">
                  <div className="mb-2">
                    <Icon name={features[6].icon as any} className="h-5 w-5 text-neutral-400 group-hover:text-purple-500 transition-colors duration-200" />
                  </div>
                  <span className="text-xs font-medium text-warm group-hover:text-foreground leading-tight transition-colors duration-200">{features[6].name}</span>
                </div>
              </Card>
            </Link>

            {/* Premier grand widget au centre */}
            <Link href="/features" className="col-span-2 row-span-2">
              <Card className="h-52 rounded-3xl border border-transparent hover:border-purple-400 bg-white shadow-sm hover:shadow-lg transition-all duration-200 group cursor-pointer">
                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                  <div className="mb-4">
                    <Icon name={bigFeatures[0].icon as any} className="h-8 w-8 text-neutral-400 group-hover:text-purple-500 transition-colors duration-200" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-700 group-hover:text-foreground mb-2 transition-colors duration-200">{bigFeatures[0].name}</h3>
                  <p className="text-xs text-neutral-500 group-hover:text-warm leading-relaxed transition-colors duration-200">{bigFeatures[0].description}</p>
                </div>
              </Card>
            </Link>

            {/* Deuxième grand widget au centre */}
            <Link href="/features" className="col-span-2 row-span-2">
              <Card className="h-52 rounded-3xl border border-transparent hover:border-purple-400 bg-white shadow-sm hover:shadow-lg transition-all duration-200 group cursor-pointer">
                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                  <div className="mb-4">
                    <Icon name={bigFeatures[1].icon as any} className="h-8 w-8 text-neutral-400 group-hover:text-green-500 transition-colors duration-200" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-700 group-hover:text-foreground mb-2 transition-colors duration-200">{bigFeatures[1].name}</h3>
                  <p className="text-xs text-neutral-500 group-hover:text-warm leading-relaxed transition-colors duration-200">{bigFeatures[1].description}</p>
                </div>
              </Card>
            </Link>

            {/* Row 2 - 1 petit à droite */}
            <Link key={features[7].name} href="/features">
              <Card className="h-24 rounded-2xl border border-transparent hover:border-purple-400 bg-white shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer">
                <div className="h-full flex flex-col items-center justify-center p-3 text-center">
                  <div className="mb-2">
                    <Icon name={features[7].icon as any} className="h-5 w-5 text-neutral-400 group-hover:text-purple-500 transition-colors duration-200" />
                  </div>
                  <span className="text-xs font-medium text-warm group-hover:text-foreground leading-tight transition-colors duration-200">{features[7].name}</span>
                </div>
              </Card>
            </Link>

            {/* Row 3 - 1 petit à gauche */}
            <Link key={features[8].name} href="/features">
              <Card className="h-24 rounded-2xl border border-transparent hover:border-purple-400 bg-white shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer">
                <div className="h-full flex flex-col items-center justify-center p-3 text-center">
                  <div className="mb-2">
                    <Icon name={features[8].icon as any} className="h-5 w-5 text-neutral-400 group-hover:text-purple-500 transition-colors duration-200" />
                  </div>
                  <span className="text-xs font-medium text-warm group-hover:text-foreground leading-tight transition-colors duration-200">{features[8].name}</span>
                </div>
              </Card>
            </Link>

            {/* Les grands widgets occupent déjà leur espace (row 2-3, col 2-5) */}
            
            {/* Row 3 - 1 petit à droite */}
            <Link key={features[9].name} href="/features">
              <Card className="h-24 rounded-2xl border border-transparent hover:border-purple-400 bg-white shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer">
                <div className="h-full flex flex-col items-center justify-center p-3 text-center">
                  <div className="mb-2">
                    <Icon name={features[9].icon as any} className="h-5 w-5 text-neutral-400 group-hover:text-purple-500 transition-colors duration-200" />
                  </div>
                  <span className="text-xs font-medium text-warm group-hover:text-foreground leading-tight transition-colors duration-200">{features[9].name}</span>
                </div>
              </Card>
            </Link>

            {/* Row 4 - 6 petits widgets */}
            {features.slice(10, 16).map((feature) => (
              <Link key={feature.name} href="/features">
                <Card className="h-24 rounded-2xl border border-transparent hover:border-purple-400 bg-white shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer">
                  <div className="h-full flex flex-col items-center justify-center p-3 text-center">
                    <div className="mb-2">
                      <Icon name={feature.icon as any} className="h-5 w-5 text-neutral-400 group-hover:text-purple-500 transition-colors duration-200" />
                    </div>
                    <span className="text-xs font-medium text-warm group-hover:text-foreground leading-tight transition-colors duration-200">{feature.name}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}