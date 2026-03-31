/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        display: ['"Syne"', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#fff8ed',
          100: '#ffefcf',
          200: '#feda9a',
          300: '#feb96a',
          400: '#fd8f38',
          500: '#fb6f18',
          600: '#ec510c',
          700: '#c43a0b',
          800: '#9c2e10',
          900: '#7d2811',
        },
        surface: {
          50:  '#f8f9fb',
          100: '#f0f2f5',
          200: '#e4e8ef',
          300: '#d0d7e3',
          400: '#9aa4b8',
          500: '#677389',
          600: '#4e5a6f',
          700: '#3a4456',
          800: '#242d3d',
          900: '#141923',
          950: '#0c1018',
        },
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse2: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        slideIn: 'slideIn 0.25s ease-out',
        fadeIn: 'fadeIn 0.3s ease-out',
        shimmer: 'shimmer 2s infinite linear',
        pulse2: 'pulse2 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
