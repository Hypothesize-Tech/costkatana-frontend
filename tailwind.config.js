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
          // CostKatana Vibrant Theme Colors
          primary: {
            50: '#f8f4ff',
            100: '#f0e7ff',
            200: '#e4d4ff',
            300: '#d1b3ff',
            400: '#b888ff',
            500: '#9B5DE5', // Main vibrant purple
            600: '#8b47d4',
            700: '#7a38c3',
            800: '#6b2fb2',
            900: '#5c26a1',
            950: '#4d1d90',
          },
          secondary: {
            50: '#fef7f7',
            100: '#fdedef',
            200: '#fbd9df',
            300: '#f7b8c5',
            400: '#f28ba8',
            500: '#F15BB5', // Hot pink-magenta
            600: '#e03a9e',
            700: '#cf2987',
            800: '#be1870',
            900: '#ad0759',
            950: '#9c0042',
          },
          accent: {
            50: '#fff9e6',
            100: '#fff0cc',
            200: '#ffe199',
            300: '#ffd266',
            400: '#ffc333',
            500: '#FF9500', // Golden orange
            600: '#e6850e',
            700: '#cc751c',
            800: '#b3652a',
            900: '#995538',
            950: '#804546',
          },
          highlight: {
            50: '#fffef0',
            100: '#fffde0',
            200: '#fffbc1',
            300: '#fff8a2',
            400: '#fff583',
            500: '#FEE440', // Neon yellow
            600: '#e5cd39',
            700: '#ccb632',
            800: '#b39f2b',
            900: '#9a8824',
            950: '#81711d',
          },
          success: {
            50: '#f0fffe',
            100: '#e0fffc',
            200: '#c1fff9',
            300: '#a2fff6',
            400: '#83fff3',
            500: '#00F5D4', // Aqua-cyan pop
            600: '#0ddcbd',
            700: '#1ac3a6',
            800: '#27aa8f',
            900: '#349178',
            950: '#417861',
          },
          danger: {
            50: '#fff0f1',
            100: '#ffe0e3',
            200: '#ffc1c7',
            300: '#ffa2ab',
            400: '#ff838f',
            500: '#FF4F64', // Neon red-pink
            600: '#e6465a',
            700: '#cc3d50',
            800: '#b33446',
            900: '#992b3c',
            950: '#802232',
          },
          // Dark theme specific colors
          dark: {
            bg: '#0E0A1F', // Deep cosmic purple-black
            panel: '#18122B', // Slightly lighter indigo-charcoal
            card: '#241A3A', // Card highlight
            text: {
              primary: '#F7F4FB', // Soft off-white with hint of lilac
              secondary: '#C7BEE2', // Secondary text
              muted: '#8E82B4', // Muted text
            }
          },
          // Light theme specific colors
          light: {
            bg: '#FFFFFF', // Pure white
            panel: '#FDF7FF', // Lavender white
            card: '#F8F0FF', // Card highlight
            text: {
              primary: '#1C1230', // Deep purple-black
              secondary: '#56397D', // Muted violet
              muted: '#7A6C99', // Muted text
            }
          },
        },
        fontFamily: {
          sans: ['Poppins', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
          display: ['Outfit', 'Poppins', 'system-ui', 'sans-serif'],
          body: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
          mono: ['Urbanist', 'ui-monospace', 'SFMono-Regular', 'monospace'],
          rounded: ['Rubik', 'Poppins', 'system-ui', 'sans-serif'],
        },
        backgroundImage: {
          'gradient-primary': 'linear-gradient(90deg, #9B5DE5, #F15BB5)',
          'gradient-secondary': 'linear-gradient(90deg, #F15BB5, #9B5DE5)',
          'gradient-accent': 'linear-gradient(90deg, #FF9500, #FEE440)',
          'gradient-warning': 'linear-gradient(90deg, #FEE440, #FF9500)',
          'gradient-success': 'linear-gradient(90deg, #00F5D4, #3DBE8B)',
          'gradient-danger': 'linear-gradient(90deg, #FF4F64, #E94E4E)',
          'gradient-dark-ambient': 'radial-gradient(circle at top left, #1E1038, #0E0A1F 70%)',
          'gradient-light-ambient': 'radial-gradient(circle at top right, #FDF7FF, #FFFFFF 70%)',
          'gradient-dark-panel': 'linear-gradient(180deg, #1C1B29, #14121D)',
          'gradient-light-panel': 'linear-gradient(180deg, #F8F0FF, #FFFFFF)',
        },
        animation: {
          'fade-in': 'fadeIn 0.5s ease-in-out',
          'slide-in': 'slideIn 0.3s ease-out',
          'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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