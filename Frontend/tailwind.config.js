/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#F4F6F5',
          100: '#E6EAE8',
          200: '#CBD4D0',
          300: '#A8B7B0',
          400: '#899791',
          500: '#71817B',
          600: '#5A6863',
          700: '#46524D',
          800: '#343D39',
          900: '#202623',
          950: '#141816',
        },
        brand: {
          blue: '#2563EB',
          blueHover: '#1D4ED8',
          blueLight: '#EFF6FF',
          amber: '#F59E0B',
          amberLight: '#FEF3C7',
          obsidian: '#1C2420',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '2xs': '0 1px 1px 0 rgba(0, 0, 0, 0.03)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.12), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)',
        'hero-cta': '0 12px 28px -4px rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backdropBlur: {
        'xs': '2px',
        '2xs': '1px',
      }
    },
  },
  plugins: [],
}
