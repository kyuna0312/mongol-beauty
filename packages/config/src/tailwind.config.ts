import type { Config } from 'tailwindcss';

export const tailwindConfig: Config = {
  content: [
    '../../apps/web/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -8px rgba(74, 44, 58, 0.12), 0 1px 3px -1px rgba(0, 0, 0, 0.08)',
        nav: '0 -4px 20px -8px rgba(74, 44, 58, 0.1), 0 -1px 4px rgba(0, 0, 0, 0.05)',
        glow: '0 0 40px -10px rgba(196, 120, 110, 0.4)',
      },
      borderRadius: {
        '4xl': '2.5rem',
      },
      colors: {
        // "Ulaanbaatar Glow" - Cosmetic Beauty Palette
        terracotta: {
          DEFAULT: '#c4786e', // same as 500
          dark: '#a55f55',    // same as 600
          light: '#d99085',   // same as 400
          50: '#fdf6f5',
          100: '#faeae8',
          200: '#f5d5d1',
          300: '#eeb5ad',
          400: '#e68f85',
          500: '#c4786e', // Primary brand
          600: '#a55f55',
          700: '#8a4d45',
          800: '#6f3f39',
          900: '#5a3430',
        },
        plum: {
          50: '#fcf8f9',
          100: '#f8f1f3',
          200: '#f0e2e6',
          300: '#e5c9d1',
          400: '#d6a7b4',
          500: '#b7849f',
          600: '#9f6b84',
          700: '#8b546a',
          800: '#6b4454', // Deep plum
          900: '#4a2c3a', // Darkest plum
        },
        rose: {
          50: '#fefcfd',
          100: '#fdf6f8',
          200: '#faebf0',
          300: '#f5dae5',
          400: '#efc2d4',
          500: '#e8a5be',
          600: '#d484a1',
          700: '#b76a86',
          800: '#9f546e',
          900: '#8b455c',
        },
        cream: {
          50: '#fefdfc',
          100: '#fdf9f6',
          200: '#faf3ef',
          300: '#f5ebe5',
          400: '#efe0d8',
          500: '#e8d0c4',
          600: '#d4b5a5',
          700: '#b89582',
          800: '#9c7a67',
          900: '#7f6354',
        },
        gold: {
          50: '#fefdf8',
          100: '#fdf9ee',
          200: '#faf3d9',
          300: '#f5e8b8',
          400: '#eed68a',
          500: '#e6c266',
          600: '#c9a959', // Accent gold
          700: '#a38645',
          800: '#8a6f3a',
          900: '#6f5a30',
        },
        // CSS-variable-based ink/muted colors
        'mb-ink': '#2a2a2a',
        'mb-ink-soft': '#4a4a4a',
        'mb-muted': '#8b847f',
        'mb-muted-light': '#a89f99',
        // Rose gold alias (maps to plum-500 — used for focus rings and accents)
        'rose-gold': {
          DEFAULT: '#b7849f',
          light: '#d4a5b9',
          soft: 'rgba(183, 132, 159, 0.12)',
        },
        // Keep primary for backwards compatibility (maps to plum)
        primary: {
          50: '#fcf8f9',
          100: '#f8f1f3',
          200: '#f0e2e6',
          300: '#e5c9d1',
          400: '#d6a7b4',
          500: '#b7849f',
          600: '#9f6b84',
          700: '#8b546a',
          800: '#6b4454',
          900: '#4a2c3a',
        },
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'scale-in': 'scale-in 0.4s ease-out forwards',
        shimmer: 'shimmer 2.5s infinite linear',
      },
    },
  },
  plugins: [],
};
