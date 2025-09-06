/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#BF2C31',
          green: '#008B6B',
          gold: '#E2C044',
          maroon: '#6F1D1B',
          moss: '#2F5D50',
          pine: '#0F3B2E',
          cream: '#F5E9D3'
        }
      },
      backgroundImage: {
        'twinkle': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)',
      },
      animation: {
        fadeIn: 'fadeIn 1s ease both',
        pulseSlow: 'pulseSlow 4s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        pulseSlow: { '0%,100%': { opacity: 0.4 }, '50%': { opacity: 1 } }
      }
    },
  },
  plugins: [],
};
