/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          smokyBlack: '#11120D',
          oliveDrab: '#565449',
          bone: '#D8CFBC',
          floralWhite: '#FFFBF4',
        },
        smoky: {
          950: '#0A0B08',
          900: '#11120D',
          800: '#1A1B15',
          700: '#262820',
          600: '#3A3C31',
        },
        olive: {
          900: '#2C2B25',
          800: '#3D3B33',
          700: '#4A483E',
          600: '#565449',
          500: '#6B695C',
          400: '#848273',
          300: '#A19F90',
        },
        bone: {
          50: '#FBF9F6',
          100: '#F4F0E9',
          200: '#EBE5D9',
          300: '#D8CFBC',
          400: '#C5BBA4',
          500: '#B0A58B',
        },
        floral: {
          50: '#FFFFFF',
          100: '#FFFBF4',
          200: '#FBF5E8',
          300: '#F5ECDA',
        },
        brand: {
          primary: '#11120D',
          accent: '#D8CFBC',
          olive: '#565449',
          white: '#FFFBF4',
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
