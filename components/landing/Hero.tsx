'use client'

import { memo, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'

export const Hero = memo(function Hero() {
  const router = useRouter()
  
  const handleGetStarted = useCallback(() => {
    router.push('/onboarding')
  }, [router])

  const handleScrollToCommunity = useCallback(() => {
    const communitySection = document.getElementById('community-section')
    if (communitySection) {
      communitySection.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  return (
    <section className="pt-24 pb-8 md:pt-32 md:pb-12">
      <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-1">
        <div className="text-center space-y-8">
          <div className="space-y-8">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-foreground leading-[1.1]">
              Modern planning for a day you'll never forget.
            </h1>
            <p className="font-sans text-lg md:text-xl text-foreground/80 leading-relaxed max-w-4xl mx-auto">
              ItsaYes is your trusted wedding companion for life's most important day.
              <br />
              We take care of the details so you can focus on the celebration.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-start">
            <div className="flex flex-col items-center gap-1">
              <Button 
                size="default" 
                className="btn-gradient h-12 w-64"
                onClick={handleGetStarted}
              >
                Say Yes & Begin. It's Free
                <Icon name="arrowRight" className="ml-2 h-5 w-5" />
              </Button>
              <span className="text-sm text-gray-500 font-medium text-center">Free Forever.</span>
            </div>
            <Button 
              size="default" 
              variant="outline"
              className="h-12 w-64 border-border hover:bg-muted hover-lift"
              onClick={handleScrollToCommunity}
            >
              <Icon name="users" className="mr-2 h-5 w-5" />
              Explore Community Projects
            </Button>
          </div>
          
          <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-16">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num, index) => (
                  <div 
                    key={num}
                    className={`aspect-[4/5] relative overflow-hidden rounded-lg shadow-lg ${
                      index >= 8 ? 'lg:block hidden' : 
                      index >= 6 ? 'md:block hidden' : 
                      'block'
                    }`}
                  >
                    <Image
                      src={`/images/home/moodboard/wedding-${num}.webp`}
                      alt={`Beautiful wedding inspiration ${num}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16.66vw"
                      priority={num <= 4}
                      loading={num <= 4 ? 'eager' : 'lazy'}
                      quality={75}
                    />
                  </div>
                ))}
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})