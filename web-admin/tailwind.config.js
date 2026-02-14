/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF8E6',
          100: '#FFE8A3',
          200: '#FFD76B',
          300: '#FFC533',
          400: '#FFB300',
          500: '#E6A100', // TBM Yellow
          600: '#CC9000',
          700: '#997000',
          800: '#664C00',
          900: '#332600',
        },
        dark: '#0A0A0A', // TBM Black
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 10px 40px rgba(15,23,42,0.08)",
      },
    },
  },
  plugins: [],
};
