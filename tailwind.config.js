/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Cinzel', 'serif'],
        'sans': ['Inter', 'sans-serif'],
        'display': ['Work Sans', 'sans-serif'],
        'graphik': ['Work Sans', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'divine-glow': 'divine-glow 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      colors: {
        parchment: {
          50: '#fefdf8',
          100: '#fdf6e3',
          200: '#f7f3e8',
          300: '#f0ebdc',
          400: '#e5ddc8',
          500: '#d6c9a8',
          600: '#c4b487',
          700: '#9c8f6b',
          800: '#7a6f56',
          900: '#5c5444',
        },
      },
      backgroundImage: {
        'parchment-texture': 'radial-gradient(circle at 20% 50%, rgba(139, 105, 20, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 105, 20, 0.1) 0%, transparent 50%)',
      }
    },
  },
  plugins: [],
};