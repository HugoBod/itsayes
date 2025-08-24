// Demo data and constants for the application

export const DEMO_PROJECTS = [
  { 
    id: '1', 
    name: 'Romantic Garden Wedding', 
    description: 'Beautiful outdoor ceremony', 
    wedding_date: '2024-06-15', 
    style: 'Garden', 
    guest_count: 120, 
    likes: 45 
  },
  { 
    id: '2', 
    name: 'Modern City Wedding', 
    description: 'Sleek downtown celebration', 
    wedding_date: '2024-08-20', 
    style: 'Modern', 
    guest_count: 80, 
    likes: 32 
  },
  { 
    id: '3', 
    name: 'Beach Sunset Ceremony', 
    description: 'Intimate beachside wedding', 
    wedding_date: '2024-07-10', 
    style: 'Beach', 
    guest_count: 60, 
    likes: 67 
  },
  { 
    id: '4', 
    name: 'Rustic Barn Wedding', 
    description: 'Charming countryside celebration', 
    wedding_date: '2024-09-05', 
    style: 'Rustic', 
    guest_count: 150, 
    likes: 28 
  },
  { 
    id: '5', 
    name: 'Classic Elegance', 
    description: 'Timeless traditional wedding', 
    wedding_date: '2024-05-25', 
    style: 'Classic', 
    guest_count: 100, 
    likes: 38 
  },
  { 
    id: '6', 
    name: 'Bohemian Dream', 
    description: 'Free-spirited artistic celebration', 
    wedding_date: '2024-10-12', 
    style: 'Bohemian', 
    guest_count: 75, 
    likes: 52 
  },
  { 
    id: '7', 
    name: 'Vintage Romance', 
    description: 'Nostalgic retro-themed wedding', 
    wedding_date: '2024-04-18', 
    style: 'Vintage', 
    guest_count: 90, 
    likes: 41 
  },
  { 
    id: '8', 
    name: 'Garden Party Wedding', 
    description: 'Whimsical outdoor garden party', 
    wedding_date: '2024-11-08', 
    style: 'Garden', 
    guest_count: 110, 
    likes: 35 
  }
]

export const WEDDING_STYLES = ['All', 'Classic', 'Bohemian', 'Modern', 'Rustic', 'Beach', 'Garden', 'Vintage']

export const FILTER_OPTIONS = ['Popular', 'Recent', 'Trending']

export const CURRENCY_CONFIG = {
  USD: { min: 5000, max: 165000, step: 1000, default: 33000, symbol: '$' },
  PHP: { min: 300000, max: 8000000, step: 50000, default: 1500000, symbol: '₱' },
  EUR: { min: 5000, max: 150000, step: 1000, default: 30000, symbol: '€' },
  GBP: { min: 4500, max: 135000, step: 1000, default: 27000, symbol: '£' },
  CAD: { min: 7000, max: 220000, step: 1000, default: 42000, symbol: 'C$' },
  AUD: { min: 8000, max: 240000, step: 1000, default: 45000, symbol: 'A$' },
  NZD: { min: 8500, max: 250000, step: 1000, default: 48000, symbol: 'NZ$' }
}

export const INTERNATIONAL_GUEST_OPTIONS = [
  {
    value: 'many',
    title: 'Yes, many international guests',
    icon: 'calendar'
  },
  {
    value: 'few',
    title: 'A few international guests',
    icon: 'users'
  },
  {
    value: 'none',
    title: 'No, all local',
    icon: 'home'
  }
]