/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./public/**/*.html",
    "./views/**/*.html",
    "./public/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f7f4', 100: '#e1efe6', 200: '#c5e0cf', 300: '#9cc9af',
          400: '#6ea988', 500: '#4c8c6a', 600: '#3a7053', 700: '#305943',
          800: '#284837', 900: '#223c2f', 950: '#0f2219',
        },
        safari: {
          50: '#fbf8f1', 100: '#f5efe0', 200: '#eadbb9', 300: '#ddc289',
          400: '#d1a45b', 500: '#c78a38', 600: '#b8722d', 700: '#995828',
          800: '#7e4726', 900: '#653a21', 950: '#371e10',
        },
        primary: {
            50: '#fbf8f1', 100: '#f5efe0', 200: '#eadbb9', 300: '#ddc289',
            400: '#d1a45b', 500: '#c78a38', 600: '#b8722d', 700: '#995828',
            800: '#7e4726', 900: '#653a21', 950: '#371e10',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
