/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
      },
      colors: {
        primary: {
          DEFAULT: '#2F5545',
          dark: '#1F3630',
          light: '#f0f7f4',
          50: '#f0f7f4',
          100: '#d9eee3',
          500: '#2F5545',
          600: '#1F3630',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#9E7A68',
          dark: '#7A5D4F',
          foreground: '#ffffff',
        },
        background: '#FFFFFF',
        foreground: '#1A1A1A',
        card: '#ffffff',
        'card-foreground': '#1A1A1A',
        muted: '#FBF9F7',
        'muted-foreground': '#6b7280',
        border: '#E5E7EB',
        warm: '#9E7A68',
        success: '#10b981',
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 100%)',
      },
      borderRadius: {
        'wedding': '12px',
      },
      boxShadow: {
        'primary': '0 4px 20px rgba(47, 85, 69, 0.15)',
        'secondary': '0 4px 20px rgba(158, 122, 104, 0.15)',
      },
    },
  },
  plugins: [],
}