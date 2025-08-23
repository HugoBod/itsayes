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
          50: '#f0f7f4',
          100: '#d9eee3',
          500: '#2F5545',
          600: '#1F3630',
        },
        secondary: {
          DEFAULT: '#9E7A68',
          dark: '#7A5D4F',
        },
        background: '#F5EFE6',
        foreground: '#1A1A1A',
        muted: '#FBF9F7',
        border: '#E5E7EB',
        warm: '#9E7A68',
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #F5EFE6 0%, #E8DDD4 100%)',
      },
      borderRadius: {
        'wedding': '12px',
      },
    },
  },
  plugins: [],
}