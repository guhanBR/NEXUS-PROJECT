/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        google: {
          bg: '#F8FAFD',          // Calm light workspace background
          surface: '#FFFFFF',     // Clean pure white surface
          subtle: '#F0F4F9',      // Subtle hover & background fill
          border: '#E0E3E7',      // Crisp subtle border
          borderLight: '#EDF0F4',
          text: '#1F1F1F',        // High contrast primary charcoal/black
          textSecondary: '#444746',// Google secondary text gray
          textMuted: '#747775',   // Muted label gray
          blue: '#0B57D0',        // Google Workspace primary blue
          blueHover: '#0842A0',
          blueSurface: '#D3E3FD', // Google M3 active pill container
          blueText: '#041E49',    // Text on active pill
          teal: '#006A60',        // Success green/teal
          tealSurface: '#CCE8E3',
          amber: '#7A4100',       // Warning amber
          amberSurface: '#FFDF9E',
          red: '#BA1A1A',         // Error / Critical red
          redSurface: '#FFDAD6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'google-xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'google-sm': '0 1px 3px 0 rgba(60, 64, 67, 0.1), 0 1px 2px 0 rgba(60, 64, 67, 0.06)',
        'google-md': '0 4px 6px -1px rgba(60, 64, 67, 0.12), 0 2px 4px -2px rgba(60, 64, 67, 0.08)',
        'google-modal': '0 12px 32px 4px rgba(60, 64, 67, 0.18)',
      },
      borderRadius: {
        'pill': '9999px',
      }
    },
  },
  plugins: [],
}
