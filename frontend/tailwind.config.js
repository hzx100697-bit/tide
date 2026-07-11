/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#EEF2EF',
        surface: '#FFFFFF',
        'surface-alt': '#E4ECEA',
        ink: '#142A2E',
        'ink-soft': '#4E6367',
        line: '#D3DEDB',
        tide: {
          DEFAULT: '#1F6F72',
          deep: '#124345',
          light: '#4C9498'
        },
        gold: '#C98A3E',
        crisis: '#B0463C'
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0.9)', opacity: '0.55' },
          '100%': { transform: 'scale(1.6)', opacity: '0' }
        },
        breathe: {
          '0%, 100%': { transform: 'scale(0.85)' },
          '50%': { transform: 'scale(1.15)' }
        }
      },
      animation: {
        ripple: 'ripple 3.5s cubic-bezier(0.4,0,0.2,1) infinite',
        breathe: 'breathe 6s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
