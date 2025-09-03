/**
 * Constants and Configuration for It's a Yes Wedding Platform
 * 
 * This file contains all static configuration data used throughout the application:
 * - Demo project data for homepage
 * - Currency configurations for budget sliders
 * - International guest options for onboarding
 * - Wedding style categories and filters
 */

// =============================================================================
// TYPE DEFINITIONS - TypeScript interfaces for better type safety
// =============================================================================

export interface DemoProject {
  id: string
  name: string
  description: string
  wedding_date: string
  style: string
  guest_count: number
  likes: number
}

export interface CurrencyConfig {
  min: number
  max: number
  step: number
  default: number
  symbol: string
}

export interface InternationalGuestOption {
  value: 'yes' | 'no'
  title: string
  icon: string
}

export type WeddingStyle = 'All' | 'Classic' | 'Bohemian' | 'Modern' | 'Rustic' | 'Beach' | 'Garden' | 'Vintage'
export type FilterOption = 'Popular' | 'Recent' | 'Trending'
export type SupportedCurrency = 'USD' | 'PHP' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'NZD'

// =============================================================================
// DEMO DATA - Used for homepage examples and community showcase
// =============================================================================

/**
 * Demo wedding projects shown on homepage and community pages
 * Used to showcase different wedding styles and inspire users
 * 
 * @interface DemoProject
 * @property {string} id - Unique identifier
 * @property {string} name - Wedding project name
 * @property {string} description - Brief description
 * @property {string} wedding_date - Date in YYYY-MM-DD format
 * @property {string} style - Wedding style category
 * @property {number} guest_count - Number of guests
 * @property {number} likes - Community likes count
 */
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

// =============================================================================
// UI CONSTANTS - Categories and filter options for user interface
// =============================================================================

/**
 * Wedding style categories available for filtering and classification
 * Used in community pages, onboarding, and project categorization
 */
export const WEDDING_STYLES = ['All', 'Classic', 'Bohemian', 'Modern', 'Rustic', 'Beach', 'Garden', 'Vintage']

/**
 * Filter options for sorting community projects and inspiration
 * Used in dropdown menus and sorting interfaces
 */
export const FILTER_OPTIONS = ['Popular', 'Recent', 'Trending']

// =============================================================================
// BUDGET CONFIGURATION - Multi-currency support for wedding budgets
// =============================================================================

/**
 * Currency configuration for budget sliders in onboarding
 * Defines min/max values, step increments, and default values per currency
 * 
 * @interface CurrencyConfig
 * @property {number} min - Minimum budget value
 * @property {number} max - Maximum budget value  
 * @property {number} step - Increment step for slider
 * @property {number} default - Default starting value
 * @property {string} symbol - Currency symbol for display
 */
export const CURRENCY_CONFIG = {
  USD: { min: 5000, max: 165000, step: 1000, default: 33000, symbol: '$' },
  PHP: { min: 300000, max: 8000000, step: 50000, default: 1500000, symbol: '₱' },
  EUR: { min: 5000, max: 150000, step: 1000, default: 30000, symbol: '€' },
  GBP: { min: 4500, max: 135000, step: 1000, default: 27000, symbol: '£' },
  CAD: { min: 7000, max: 220000, step: 1000, default: 42000, symbol: 'C$' },
  AUD: { min: 8000, max: 240000, step: 1000, default: 45000, symbol: 'A$' },
  NZD: { min: 8500, max: 250000, step: 1000, default: 48000, symbol: 'NZ$' }
}

// =============================================================================
// ONBOARDING OPTIONS - Predefined choices for guest information step
// =============================================================================

/**
 * Options for international guests question in onboarding step 3
 * Used to understand guest travel needs and plan accordingly
 * 
 * @interface InternationalGuestOption
 * @property {string} value - Internal value for form processing
 * @property {string} title - Display text shown to user
 * @property {string} icon - Icon name from Lucide React icon set
 */
export const INTERNATIONAL_GUEST_OPTIONS = [
  {
    value: 'yes',
    title: 'Yes',
    icon: 'check'
  },
  {
    value: 'no',
    title: 'No',
    icon: 'x'
  }
]

// =============================================================================
// USAGE EXAMPLES & HELPER FUNCTIONS
// =============================================================================

/**
 * Get currency configuration by currency code
 * @param {SupportedCurrency} currency - Currency code (USD, EUR, etc.)
 * @returns {CurrencyConfig} Currency configuration object
 */
export const getCurrencyConfig = (currency: SupportedCurrency): CurrencyConfig => {
  return CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD
}

/**
 * Format budget amount with currency symbol
 * @param {number} amount - Budget amount
 * @param {SupportedCurrency} currency - Currency code
 * @returns {string} Formatted budget string
 */
export const formatBudget = (amount: number, currency: SupportedCurrency): string => {
  const config = getCurrencyConfig(currency)
  return `${config.symbol}${amount.toLocaleString()}`
}

/**
 * Get wedding style options excluding 'All'
 * @returns {WeddingStyle[]} Array of wedding styles without 'All' option
 */
export const getWeddingStylesForSelection = (): WeddingStyle[] => {
  return WEDDING_STYLES.filter(style => style !== 'All') as WeddingStyle[]
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Check if a currency is supported
 * @param {string} currency - Currency code to validate
 * @returns {boolean} Whether currency is supported
 */
export const isSupportedCurrency = (currency: string): currency is SupportedCurrency => {
  return Object.keys(CURRENCY_CONFIG).includes(currency)
}

/**
 * Validate budget amount for given currency
 * @param {number} amount - Amount to validate
 * @param {SupportedCurrency} currency - Currency code
 * @returns {boolean} Whether amount is within valid range
 */
export const isValidBudgetAmount = (amount: number, currency: SupportedCurrency): boolean => {
  const config = getCurrencyConfig(currency)
  return amount >= config.min && amount <= config.max
}