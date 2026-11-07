/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E8F5EE',
          100: '#D1EBE0',
          200: '#A4D7C2',
          500: '#16845B', // Primary accent green
          600: '#126F4C',
          700: '#0E5A3D',
          800: '#0A452E',
        },
        surface: {
          primary: '#FFFFFF',
          secondary: '#F8FAFC',
          subtle: '#F1F5F9',
        },
        border: {
          light: '#E5E7EB',
          subtle: '#F1F5F9',
        },
        ink: {
          primary: '#111827',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        status: {
          success: '#16845B',
          'success-bg': '#E8F5EE',
          warning: '#D97706',
          'warning-bg': '#FEF3C7',
          danger: '#DC2626',
          'danger-bg': '#FEE2E2',
          info: '#2563EB',
          'info-bg': '#EFF6FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'card': '10px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'dropdown': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'drawer': '-4px 0 16px rgba(0, 0, 0, 0.08)',
      },
      zIndex: {
        '60': '60', // DocumentPreviewModal & DocumentReviewDialog (above z-50 drawer)
        '70': '70', // Reserved for future top-priority overlays
      }
    },
  },
  plugins: [],
}
