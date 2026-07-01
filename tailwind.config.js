/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bubu: {
          base: '#0A0E1F',
          card: '#0D1226',
          gold: '#E8B923',
          'gold-dark': '#D4A017',
          danger: '#E5484D',
          success: '#30A46C',
          info: '#3B82F6',
          divider: '#1E2540',
          secondary: '#9CA3AF',
          muted: '#6B7280',
        },
      },
      fontFamily: {
        sans: [
          'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont',
          'Segoe UI', 'Roboto', 'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
