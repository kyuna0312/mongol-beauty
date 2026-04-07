import type { Config } from 'tailwindcss';

export const tailwindConfig: Config = {
  content: [
    '../../apps/web/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Quicksand"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 28px -6px rgba(209, 74, 98, 0.07), 0 10px 24px -12px rgba(0, 0, 0, 0.05)',
        nav: '0 -6px 28px -8px rgba(209, 74, 98, 0.06), 0 -2px 8px rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      colors: {
        // INCELLDERM MONGOLIA Color Palette
        primary: {
          // Soft dusty rose (beauty e‑commerce — gentle, not harsh)
          50: '#fff8f8',
          100: '#ffefef',
          200: '#ffd9df',
          300: '#ffb8c4',
          400: '#f4879a',
          500: '#e85d75',
          600: '#d14a62',
          700: '#b03d52',
          800: '#923545',
          900: '#7a3042',
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
