/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: 'media',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@yobta/ui/**/*.{js,jsx}',
  ],
  presets: [require('@yobta/ui/tailwind-preset')],
  theme: {
    extend: {
      animation: {
        'slide-in-bottom': 'slideInBottom 0.72s ease forwards',
        'slide-out-bottom': 'slideOutBottom 0.56s ease forwards',
        'slide-in-left': 'slideInLeft 0.72s ease forwards',
        'slide-out-left': 'slideOutLeft 0.56s ease forwards',
        'slide-in-right': 'slideInRight 0.72s ease forwards',
        'slide-out-right': 'slideOutRight 0.56s ease forwards',
        'slide-in-top': 'slideInTop 0.72s ease forwards',
        'slide-out-top': 'slideOutTop 0.56s ease forwards',
      },
      keyframes: {
        slideInBottom: {
          from: { transform: 'translateY(6rem)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 100 },
        },
        slideOutBottom: {
          from: { transform: 'translateY(0)', opacity: 100 },
          to: { transform: 'translateY(6rem)', opacity: 0 },
        },
        slideInLeft: {
          from: { transform: 'translateX(-6rem)', opacity: 0 },
          to: { transform: 'translateX(0)', opacity: 100 },
        },
        slideOutLeft: {
          from: { transform: 'translateX(0)', opacity: 100 },
          to: { transform: 'translateX(-6rem)', opacity: 0 },
        },
        slideInRight: {
          from: { transform: 'translateX(6rem)', opacity: 0 },
          to: { transform: 'translateX(0)', opacity: 100 },
        },
        slideOutRight: {
          from: { transform: 'translateX(0)', opacity: 100 },
          to: { transform: 'translateX(6rem)', opacity: 0 },
        },
        slideInTop: {
          from: { transform: 'translateY(-6rem)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 100 },
        },
        slideOutTop: {
          from: { transform: 'translateY(0)', opacity: 100 },
          to: { transform: 'translateY(-6rem)', opacity: 0 },
        },
      },

      backgroundImage: () => ({
        'image-icon': "url('/image.svg')",
      }),
      backgroundSize: {
        'icon-size': '3rem',
      },
      colors: {
        vk: '#0077FF',
      },
      fontFamily: {
        sans: '"San Francisco", "Helvetica Neue", "Roboto", "Segoe UI", sans-serif',
      },
      width: {
        promo: '208px',
        avatar: '16vw',
      },
      maxWidth: {
        'user-name': '6rem',
        price: '6rem',
      },
      minWidth: {
        icon: '1rem',
        promo: '208px',
        rubric: '10rem',
        card: '5rem',
      },
      height: {
        promo: '288px',
        preview: '48vh',
      },
      minHeight: {
        promo: '288px',
      },
      zIndex: {
        under: -1,
      },
    },
  },
  variants: {
    extend: {
      opacity: ['dark'],
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
}
