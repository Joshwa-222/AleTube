/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: { colors: { ink: '#090909', panel: '#151515', accent: '#e50914' }, fontFamily: { sans: ['DM Sans', 'Noto Sans Ethiopic', 'sans-serif'] } } },
  plugins: []
}