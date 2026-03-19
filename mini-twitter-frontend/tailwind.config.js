/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          400: '#1d9bf0',
          500: '#1296f7',
          600: '#0d85df',
        },
        surface: '#19263d',
        stroke: '#50698f',
        page: '#020817',
      },
      boxShadow: {
        glow: '0 0 80px rgba(29, 155, 240, 0.08)',
      },
      backgroundImage: {
        'page-gradient': 'radial-gradient(circle at top, rgba(29,155,240,0.12), transparent 35%), linear-gradient(90deg, #030b19 0%, #020817 20%, #020817 80%, #030b19 100%)',
      },
    },
  },
  plugins: [],
};
