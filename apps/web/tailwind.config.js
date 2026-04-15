const { tailwindConfig } = require('@mongol-beauty/config');

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...tailwindConfig,
  theme: {
    ...tailwindConfig.theme,
    extend: {
      ...tailwindConfig.theme?.extend,
      colors: {
        ...tailwindConfig.theme?.extend?.colors,
        // Ensure these tokens are always available regardless of TS compilation
        'mb-ink': '#2a2a2a',
        'mb-ink-soft': '#4a4a4a',
        'mb-muted': '#8b847f',
        'mb-muted-light': '#a89f99',
        'rose-gold': {
          DEFAULT: '#b7849f',
          light: '#d4a5b9',
          soft: 'rgba(183, 132, 159, 0.12)',
        },
        terracotta: {
          ...(tailwindConfig.theme?.extend?.colors?.terracotta ?? {}),
          DEFAULT: '#c4786e',
          dark: '#a55f55',
          light: '#d99085',
        },
      },
    },
  },
};
