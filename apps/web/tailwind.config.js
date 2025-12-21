/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0E27',
        surface: '#141B3D',
        'surface-light': '#1E2749',
        accent: '#00A9E0',
        live: '#00D665',
      },
    },
  },
  plugins: [],
}
