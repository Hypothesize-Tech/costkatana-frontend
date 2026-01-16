/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          // Cost Katana Professional Green Theme Colors
          primary: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#06ec9e', // Main brand green (matching logo)
            600: '#009454', // Darker green from logo
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
            950: '#052e16',
          },
          secondary: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b', // Professional slate
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
            950: '#020617',
          },
          accent: {
            50: '#fefce8',
            100: '#fef9c3',
            200: '#fef08a',
            300: '#fde047',
            400: '#facc15',
            500: '#eab308', // Golden yellow accent
            600: '#ca8a04',
            700: '#a16207',
            800: '#854d0e',
            900: '#713f12',
            950: '#422006',
          },
          highlight: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9', // Bright blue highlight
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
            950: '#082f49',
          },
          success: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e', // Success green
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
            950: '#052e16',
          },
          danger: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444', // Error red
            600: '#dc2626',
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d',
            950: '#450a0a',
          },
          // Dark theme specific colors
          dark: {
            bg: {
              100: '#000000', // Pure black
              200: '#0C1012', // Landing page dark surface
              300: '#1a1a1a', // Slightly lighter black
            },
            panel: '#0C1012', // Landing page hero surface
            card: '#1a1a1a', // Card highlight
            text: {
              primary: '#f8fafc', // Clean white
              secondary: '#cbd5e1', // Secondary text
              muted: '#94a3b8', // Muted text
            }
          },
          // Light theme specific colors
          light: {
            bg: '#ffffff', // Pure white
            panel: '#f8fafc', // Light slate
            card: '#f1f5f9', // Card highlight
            text: {
              primary: '#0f172a', // Deep slate
              secondary: '#475569', // Muted slate
              muted: '#64748b', // Muted text
            }
          },
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
          display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
          body: ['Inter', 'system-ui', 'sans-serif'],
          mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'SFMono-Regular', 'monospace'],
          rounded: ['Nunito', 'Inter', 'system-ui', 'sans-serif'],
        },
        backgroundImage: {
          'gradient-primary': 'linear-gradient(135deg, #06ec9e, #009454)',
          'gradient-secondary': 'linear-gradient(135deg, #64748b, #334155)',
          'gradient-accent': 'linear-gradient(135deg, #eab308, #ca8a04)',
          'gradient-warning': 'linear-gradient(135deg, #f59e0b, #d97706)',
          'gradient-success': 'linear-gradient(135deg, #22c55e, #16a34a)',
          'gradient-danger': 'linear-gradient(135deg, #ef4444, #dc2626)',
          'gradient-highlight': 'linear-gradient(135deg, #0ea5e9, #0284c7)',
          'gradient-dark-ambient': 'linear-gradient(135deg, #000000 0%, #0C1012 25%, #001a0d 50%, #0C1012 75%, #000000 100%)',
          'gradient-light-ambient': 'radial-gradient(circle at top right, #f8fafc, #ffffff 70%)',
          'gradient-dark-panel': 'linear-gradient(180deg, #1a1a1a, #0C1012)',
          'gradient-light-panel': 'linear-gradient(180deg, #f1f5f9, #ffffff)',
          'gradient-brand': 'linear-gradient(135deg, #06ec9e, #22c55e, #16a34a)',
          'gradient-professional': 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
        },
        animation: {
          'fade-in': 'fadeIn 0.5s ease-in-out',
          'slide-in': 'slideIn 0.3s ease-out',
          'slide-up': 'slideUp 0.4s ease-out',
          'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'shimmer': 'shimmer 2s linear infinite',
          'float': 'float 3s ease-in-out infinite',
          'rotate-slow': 'rotate-slow 3s linear infinite',
          'rotate-reverse': 'rotate-reverse 2s linear infinite',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideIn: {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(0)' },
          },
          slideUp: {
            '0%': { transform: 'translateY(100%)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          shimmer: {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(100%)' },
          },
          float: {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-10px)' },
          },
          'rotate-slow': {
            'from': { transform: 'rotate(0deg)' },
            'to': { transform: 'rotate(360deg)' },
          },
          'rotate-reverse': {
            'from': { transform: 'rotate(360deg)' },
            'to': { transform: 'rotate(0deg)' },
          },
        },
        animationDelay: {
          '75': '75ms',
          '100': '100ms',
          '150': '150ms',
          '200': '200ms',
          '300': '300ms',
          '500': '500ms',
          '700': '700ms',
          '1000': '1000ms',
        },
        screens: {
          'xs': '475px',
        },
      },
    },
    plugins: [
      import('@tailwindcss/forms'),
      import('@tailwindcss/typography'),
    ],
  }