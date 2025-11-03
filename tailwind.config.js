/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Havana Elephant Brand Colors
        'havana-navy': {
          DEFAULT: '#0a1628',
          light: '#1a2332',
          dark: '#0d1b2a',
        },
        'havana-cyan': {
          DEFAULT: '#00d9ff',
          light: '#4dd0e1',
          dark: '#00bcd4',
        },
        'havana-orange': {
          DEFAULT: '#ff9800',
          light: '#ffb74d',
          dark: '#ffa726',
        },
        'havana-pink': {
          DEFAULT: '#ff006e',
          light: '#f06292',
          dark: '#e91e63',
        },
        'havana-purple': {
          DEFAULT: '#9c27b0',
          light: '#8e24aa',
          dark: '#7b1fa2',
        },
        // Keep hvna for token references
        hvna: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#00d9ff',
          600: '#00bcd4',
          700: '#0ea5e9',
        }
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #ff9800, #ff006e)',
        'gradient-cool': 'linear-gradient(135deg, #00d9ff, #9c27b0)',
        'gradient-havana': 'linear-gradient(to bottom right, #0a1628, #1a2332, #0d1b2a)',
      },
    },
  },
  plugins: [],
}