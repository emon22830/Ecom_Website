/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary color (Trust & Professionalism)
        primary: {
          DEFAULT: '#0057B7',
          light: '#3378C7',
          dark: '#004494',
        },
        // Secondary color (Clean & Minimalist)
        secondary: {
          DEFAULT: '#F5F5F5',
          dark: '#E0E0E0',
        },
        // Success & Action (Encouraging Purchases)
        success: {
          DEFAULT: '#27AE60',
          light: '#2ECC71',
          dark: '#219653',
        },
        // Warnings & Pending Actions
        warning: {
          DEFAULT: '#F39C12',
          light: '#F7B731',
          dark: '#D68910',
        },
        // Errors & Alerts
        error: {
          DEFAULT: '#E74C3C',
          light: '#F16C5D',
          dark: '#C0392B',
        },
        // Special Features & Highlights
        highlight: {
          DEFAULT: '#9B59B6',
          light: '#AF7AC5',
          dark: '#8E44AD',
        },
        // Dark mode background colors
        darkBg: {
          primary: '#121212',
          secondary: '#1E1E1E',
          tertiary: '#2D2D2D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
        'slide-down': 'slideDown 0.5s ease-in-out',
        'slide-left': 'slideLeft 0.5s ease-in-out',
        'slide-right': 'slideRight 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}; 