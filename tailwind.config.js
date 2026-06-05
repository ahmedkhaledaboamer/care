

/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        brand: {
          // primary CTA gradient: green → blue (matches logo)
          gold: '#70A426',       // logo green
          goldLight: '#125697',  // logo blue

          // soft green tints (card backgrounds, soft pink role)
          pink: '#E8F3D6',
          pinkDark: '#C5DC95',

          // soft blue tints (card backgrounds, peach/sky role)
          peach: '#D9E5F2',
          peachDark: '#95B4D8',

          // alternate cool tints (purple role)
          purple: '#E1F0CB',
          purpleDark: '#B5CCE5',

          // very pale neutrals
          cream: '#F4F8EC',
          beige: '#EEF3F8',

          // deep navy from logo blue (footer, headings)
          dark: '#0A2E52',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}

