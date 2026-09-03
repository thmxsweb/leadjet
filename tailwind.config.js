/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm, human palette — not flashy.
        ink: {
          950: '#141210',
          900: '#1c1917',
          800: '#292524',
          700: '#3a3531',
          500: '#78716c',
          300: '#c7bfb8',
          100: '#f2ede8',
        },
        brand: {
          500: '#e07a4b', // warm terracotta
          600: '#c9663a',
          400: '#ec9a72',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
