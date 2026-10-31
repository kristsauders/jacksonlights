import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Set via next/font in app/layout.tsx (self-hosted, no external
        // request). Falls back to the system stack if a variable is ever
        // missing, e.g. during a font load error.
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
        // Distinct display face for headlines and brand moments — used via
        // the `font-display` utility, not applied everywhere by default.
        display: ['var(--font-display)', ...defaultTheme.fontFamily.sans],
      },
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
