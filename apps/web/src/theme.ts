// Chakra UI v3 theme configuration
// Note: Chakra UI v3 uses a different theming system
// This file can be used for custom CSS variables or future theme extensions

export const themeConfig = {
  colors: {
    // INCELLDERM MONGOLIA Color Palette
    primary: {
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
  },
};

// For Chakra UI v3, theme is configured via CSS variables
// Components can use these colors via the color prop
export default themeConfig;
