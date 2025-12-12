/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'luxury': ['Cinzel', 'serif'],
        'body': ['Playfair Display', 'serif'],
        'script': ['Monsieur La Doulaise', 'cursive'],
      },
    },
  },
  plugins: [],
}

