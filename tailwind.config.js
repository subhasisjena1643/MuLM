/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 8s ease infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2.5s linear infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'particle-drift': 'particle-drift 20s linear infinite',
        'orb-float': 'orb-float 15s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        glow: {
          '0%': { 'box-shadow': '0 0 20px rgba(99, 102, 241, 0.5)' },
          '100%': { 'box-shadow': '0 0 40px rgba(99, 102, 241, 0.8)' }
        },
        shimmer: {
          '0%': { 'background-position': '-1000px 0' },
          '100%': { 'background-position': '1000px 0' }
        },
        breathe: {
          '0%, 100%': { 'opacity': '0.6' },
          '50%': { 'opacity': '1' }
        },
        'particle-drift': {
          '0%': { 
            transform: 'translateY(100vh) translateX(0px) scale(0)', 
            opacity: '0' 
          },
          '10%': { 
            opacity: '1' 
          },
          '90%': { 
            opacity: '1' 
          },
          '100%': { 
            transform: 'translateY(-100vh) translateX(100px) scale(1)', 
            opacity: '0' 
          }
        },
        'orb-float': {
          '0%, 100%': { 
            transform: 'translateY(0px) translateX(0px) scale(1)' 
          },
          '25%': { 
            transform: 'translateY(-20px) translateX(10px) scale(1.1)' 
          },
          '50%': { 
            transform: 'translateY(-10px) translateX(-10px) scale(0.9)' 
          },
          '75%': { 
            transform: 'translateY(10px) translateX(5px) scale(1.05)' 
          }
        }
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        }
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        display: ['Cal Sans', 'Space Grotesk', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      }
    },
  },
  plugins: [],
}
