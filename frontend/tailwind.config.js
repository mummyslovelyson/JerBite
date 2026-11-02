/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF5EE',
          100: '#FFE7D6',
          200: '#FED7C2',
          300: '#FDB896',
          400: '#FF885A',
          500: '#FF6B3D',
          600: '#FF5A26', // Primary FoodAnalytics tablet vibrant orange
          700: '#E0450A',
          800: '#B93605',
          900: '#8C2904',
          950: '#4D1401'
        },
        ink: {
          50: '#FBF9F7',  // Warm culinary canvas background
          100: '#F5F2EB', // Soft surfaces & pill background
          200: '#EFECE6', // Delicate modern card borders
          300: '#DDD8CE',
          400: '#A8A29E', // Subtitles & placeholders
          500: '#78716C', // Muted label text
          600: '#57534E',
          700: '#44403C', // Body text
          800: '#292524',
          900: '#1C1917', // Bold headers
          950: '#0C0A09'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif']
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '2xs': '0 1px 1px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 2px 14px 0 rgba(0, 0, 0, 0.025)',
        'pill': '0 2px 8px 0 rgba(255, 90, 38, 0.22)'
      }
    }
  },
  plugins: []
};
