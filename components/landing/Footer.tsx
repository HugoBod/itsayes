'use client'

import Link from 'next/link'
import { Icon } from '@/components/ui/icons'
import { Logo } from '@/components/ui/logo'

const footerLinks = {
  Product: [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Templates', href: '#templates' },
    { name: 'Integrations', href: '#integrations' },
  ],
  Community: [
    { name: 'Browse Projects', href: '/community' },
    { name: 'Success Stories', href: '#stories' },
    { name: 'Blog', href: '#blog' },
    { name: 'Events', href: '#events' },
  ],
  Company: [
    { name: 'About', href: '#about' },
    { name: 'Careers', href: '#careers' },
    { name: 'Contact', href: '#contact' },
    { name: 'Press', href: '#press' },
  ],
  Legal: [
    { name: 'Privacy', href: '#privacy' },
    { name: 'Terms', href: '#terms' },
    { name: 'Cookie Policy', href: '#cookies' },
    { name: 'License', href: '#license' },
  ],
}

const socialLinks = [
  { name: 'Twitter', icon: 'twitter', href: '#' },
  { name: 'Facebook', icon: 'facebook', href: '#' },
  { name: 'Instagram', icon: 'instagram', href: '#' },
  { name: 'LinkedIn', icon: 'linkedin', href: '#' },
]

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-1 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 inline-block cursor-pointer">
              <Logo textColor="text-white" size="lg" heartColor="bg-white" />
            </Link>
            <p className="text-neutral-400 text-sm mb-4">
              Making wedding planning simple, beautiful, and stress-free.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer"
                  aria-label={social.name}
                >
                  <Icon name={social.icon as 'twitter' | 'facebook' | 'instagram' | 'linkedin'} className="h-4 w-4 text-neutral-400" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-3 text-white">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-neutral-400 hover:text-white text-sm transition-colors cursor-pointer"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-400 text-sm">
              © {new Date().getFullYear()} ItsaYes. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#privacy" className="text-neutral-400 hover:text-white text-sm transition-colors cursor-pointer">
                Privacy Policy
              </Link>
              <Link href="#terms" className="text-neutral-400 hover:text-white text-sm transition-colors cursor-pointer">
                Terms of Service
              </Link>
              <Link href="#cookies" className="text-neutral-400 hover:text-white text-sm transition-colors cursor-pointer">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}