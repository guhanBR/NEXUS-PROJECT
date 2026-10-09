/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        carbon: {
          50: '#F0F4F2',
          100: '#E1EBE6',
          200: '#CBD9D2',
          300: '#A3BDB3',
          400: '#759B8E',
          500: '#4E7769',
          600: '#3A5C50',
          700: '#2C463D',
          800: '#1F312B',
          900: '#14201C',
          950: '#0B1310',
        },
        mint: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#052E16',
        },
        emerald: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        brand: {
          mint: '#10B981',
          mintHover: '#059669',
          mintLight: '#ECFDF5',
          carbon: '#0D1411',
          titanium: '#1E2B25',
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
