import type { Config } from 'tailwindcss';

export const tailwindConfig: Config = {
  content: [
    '../../apps/web/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // INCELLDERM MONGOLIA Color Palette
        primary: {
          // Deep Maroon (main brand color)
          50: '#fdf2f2',
          100: '#fce7e7',
          200: '#f9d1d1',
          300: '#f4a8a8',
          400: '#ed7a7a',
          500: '#e14d4d', // Deep maroon base
          600: '#c93a3a', // Deep maroon
          700: '#a82d2d',
          800: '#8b2525',
          900: '#722020',
        },
        gold: {
          // Gold accents (swirls, sparkles)
          50: '#fffef7',
          100: '#fffceb',
          200: '#fff8d1',
          300: '#fff2a8',
          400: '#ffe875',
          500: '#ffd700', // Pure gold
          600: '#e6c200',
          700: '#cc9900',
          800: '#b38600',
          900: '#996600',
        },
        beige: {
          // Light beige (rings, text, patterns)
          50: '#fefdfb',
          100: '#fdf9f3',
          200: '#faf3e6',
          300: '#f6ead4',
          400: '#f0dcc0',
          500: '#e8c9a8', // Light beige base
          600: '#d4b08a',
          700: '#b8966f',
          800: '#9c7d5a',
          900: '#7f6549',
        },
        accent: {
          // Light pink (secondary hearts)
          50: '#fef7f7',
          100: '#fdeeee',
          200: '#fbdcdc',
          300: '#f7c0c0',
          400: '#f19a9a',
          500: '#e97a7a',
          600: '#d95a5a',
          700: '#b84a4a',
          800: '#973d3d',
          900: '#7d3333',
        },
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
};
